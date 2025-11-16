import { createState } from './state';
import { enableRawMode, disableRawMode } from './tty';
import { render, finalize, cancel } from './renderer';
import { handleKeyPress } from './key-press-handler';
import { InputParser } from './input-parser';
import { AbortError } from './errors';
import { nextTick } from 'process';
import { defaultStyle, color } from './styles';
import type { Style, UserOptionsStyle, ColorName } from './styles';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', 'ⴴ', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL = 80;

type ValidateFn = (value: string) => boolean | string;

type MultilineOptions = {
  prompt: string;
  instruction?: string | boolean;
  default?: string;
  required?: boolean;
  validate?: ValidateFn;
  placeholder?: string;
  spinner?: boolean;
  style?: UserOptionsStyle;
  maxLength?: number;
};

function mergeStyles(defaults: Style, overrides: UserOptionsStyle = {}): Style {
  const style: Style = {
    prefixes: { ...defaults.prefixes, ...overrides.prefixes },
    colors: { ...defaults.colors },
  };
  if (overrides.colors) {
    for (const key in overrides.colors) {
      const k = key as keyof Style['colors'];
      const value = overrides.colors[k];
      if (typeof value === 'string') {
        style.colors[k] = color[value as ColorName] || ((str: string) => str);
      } else if (typeof value === 'function') {
        style.colors[k] = value;
      }
    }
  }
  return style;
}

export function multiline(options: string | MultilineOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      prompt,
      instruction: instructionArg = true,
      default: defaultValue = '',
      required = false,
      validate,
      placeholder,
      spinner = false,
      style: userStyle,
      maxLength,
    } = typeof options === 'string' ? ({ prompt: options } as MultilineOptions) : options;

    const style = mergeStyles(defaultStyle, userStyle);

    const defaultInstruction = 'Press Enter to submit, Shift+Enter for a new line.';
    let instruction: string | false;
    if (instructionArg === false) instruction = false;
    else if (typeof instructionArg === 'string') instruction = instructionArg;
    else instruction = defaultInstruction;

    const state = createState(prompt, instruction, style, defaultValue, placeholder, maxLength);
    if (spinner) {
      state.spinner = { frames: SPINNER_FRAMES, currentFrame: 0 };
    }

    const parser = new InputParser();
    let isDone = false;
    let needsRender = false;
    let spinnerInterval: NodeJS.Timeout | null = null;

    const updateScreen = (output: string) => {
      process.stdout.write(output);
    };

    const scheduleRender = () => {
      if (needsRender || isDone) return;
      needsRender = true;
      nextTick(() => {
        if (isDone) return;
        updateScreen(render(state));
        needsRender = false;
      });
    };

    const cleanup = (finalState: 'finalize' | 'cancel') => {
      if (isDone) return;
      isDone = true;
      if (spinnerInterval) clearInterval(spinnerInterval);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
      process.removeListener('SIGINT', onSigInt);
      disableRawMode();
      if (finalState === 'finalize') updateScreen(finalize(state));
      else updateScreen(cancel(style));
    };

    const onKey = (key: {
      name: string;
      ctrl: boolean;
      meta: boolean;
      shift: boolean;
      sequence: string;
    }) => {
      handleKeyPress(state, key);
      scheduleRender();
    };

    const onPaste = (text: string) => {
      if (state.error) state.error = null;

      const currentLength = state.value.join('\n').length;
      let truncatedText = text;

      if (state.maxLength && currentLength + text.length > state.maxLength) {
        const availableSpace = state.maxLength - currentLength;
        if (availableSpace <= 0) {
          state.error = `Input cannot exceed ${state.maxLength} characters.`;
          scheduleRender();
          return;
        }
        truncatedText = text.substring(0, availableSpace);
        state.error = `Input cannot exceed ${state.maxLength} characters. Pasted text was truncated.`;
      }

      const lines = truncatedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const currentLine = state.value[state.cursor.y];
      const beforeCursor = currentLine?.substring(0, state.cursor.x) ?? '';
      const afterCursor = currentLine?.substring(state.cursor.x) ?? '';
      if (lines.length === 1) {
        state.value[state.cursor.y] = beforeCursor + lines[0] + afterCursor;
        state.cursor.x += lines[0]?.length ?? 0;
      } else {
        state.value[state.cursor.y] = beforeCursor + lines[0];
        const newLines: string[] = [];
        for (let i = 1; i < lines.length - 1; i++) newLines.push(lines[i] ?? '');
        const lastLine = lines[lines.length - 1] + afterCursor;
        newLines.push(lastLine);
        state.value.splice(state.cursor.y + 1, 0, ...newLines);
        state.cursor.y += lines.length - 1;
        state.cursor.x = lines[lines.length - 1]?.length ?? 0;
      }
      scheduleRender();
    };

    const onData = (data: Buffer) => {
      const chunk = data.toString('utf8');
      if (chunk === '\x03') {
        cleanup('cancel');
        reject(new AbortError());
        return;
      }
      parser.parse(data);
      if (state.isDone) {
        const finalValue = state.value.join('\n');
        if (required && finalValue.trim() === '') {
          state.isDone = false;
          state.error = 'Input is required.';
          scheduleRender();
          return;
        }
        if (validate) {
          const result = validate(finalValue);
          if (result !== true) {
            state.isDone = false;
            state.error = result === false ? 'Invalid input.' : result;
            scheduleRender();
            return;
          }
        }
        cleanup('finalize');
        resolve(finalValue);
      }
    };

    const onSigInt = () => {
      cleanup('cancel');
      reject(new AbortError('Aborted by SIGINT'));
    };

    parser.on('key', onKey);
    parser.on('paste', onPaste);
    enableRawMode();
    process.stdin.on('data', onData);
    process.on('SIGINT', onSigInt);
    process.stdin.setEncoding('utf8');
    process.stdin.resume();

    if (state.spinner) {
      spinnerInterval = setInterval(() => {
        state.spinner!.currentFrame =
          (state.spinner!.currentFrame + 1) % state.spinner!.frames.length;
        scheduleRender();
      }, SPINNER_INTERVAL);
    }

    scheduleRender();
  });
}

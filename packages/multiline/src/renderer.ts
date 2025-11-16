import * as ansi from "ansi-escapes";
import type { State } from "./state";
import type { Style } from "./styles";

const escapes = (ansi as any).default;

let hasSavedCursor = false;

export function render(state: State): string {
  const { style } = state;
  let output = "";
  if (!hasSavedCursor) {
    output += escapes.cursorSavePosition;
    hasSavedCursor = true;
  }

  output += escapes.cursorRestorePosition + escapes.eraseDown;

  const lines: string[] = [];

  const prefix = state.spinner
    ? style.colors.prompt(
        state.spinner.frames[state.spinner.currentFrame] ?? ""
      )
    : style.colors.prompt(style.prefixes.prompt);
  lines.push(`${prefix} ${style.colors.promptTitle(state.prompt)}`);

  const isInputEmpty = state.value.length === 1 && state.value[0] === "";
  if (isInputEmpty && state.placeholder) {
    const placeholderLines = state.placeholder
      .split("\n")
      .map(
        (line) =>
          `${style.colors.inputPrefix(
            style.prefixes.input
          )} ${style.colors.placeholder(line)}`
      );
    lines.push(...placeholderLines);
  } else {
    const valueLines = state.value.map(
      (line) => `${style.colors.inputPrefix(style.prefixes.input)} ${line}`
    );
    lines.push(...valueLines);
  }

  if (state.error) {
    lines.push(
      `${style.colors.error(style.prefixes.error)} ${style.colors.error(
        state.error
      )}`
    );
  }

  if (state.instruction) {
    if (!state.error) lines.push("");
    lines.push(style.colors.instruction(state.instruction));
  }

  output += lines.join("\n");

  const promptLines = 1;
  output +=
    escapes.cursorRestorePosition +
    escapes.cursorDown(promptLines + state.cursor.y) +
    escapes.cursorForward(2 + state.cursor.x);

  return output;
}

export function finalize(state: State): string {
  const { style } = state;
  let output = "";
  output += escapes.cursorRestorePosition + escapes.eraseDown;
  const promptLine = `${style.colors.success(style.prefixes.success)} ${
    state.prompt
  }`;
  const finalValue = state.value.join("\n");
  const answer =
    finalValue.trim() === ""
      ? style.colors.placeholder("[empty]")
      : `\n${style.colors.finalAnswer(finalValue)}`;
  output += `${promptLine} ${answer}\n`;
  hasSavedCursor = false;
  return output;
}

export function cancel(style: Style): string {
  let output = "";
  output += escapes.cursorRestorePosition + escapes.eraseDown;
  output += `${style.colors.error(style.prefixes.error)} Aborted.\n`;
  hasSavedCursor = false;
  return output;
}

import { EventEmitter } from 'events';

const PASTE_START = '\x1b[200~';
const PASTE_END = '\x1b[201~';

const KEY_SEQUENCES: {
  [key: string]: { name: string; shift: boolean; ctrl: boolean; meta: boolean };
} = {
  // Word navigation
  '\x1b[1;5C': { name: 'right', shift: false, ctrl: true, meta: false },
  '\x1b[1;5D': { name: 'left', shift: false, ctrl: true, meta: false },
  '\x1bf': { name: 'right', shift: false, ctrl: true, meta: false },
  '\x1bb': { name: 'left', shift: false, ctrl: true, meta: false },

  // Word deletion
  '\x17': { name: 'w', shift: false, ctrl: true, meta: false },
  '\x1b\x7f': { name: 'backspace', shift: false, ctrl: false, meta: true },

  // Standard keys
  '\r': { name: 'return', shift: false, ctrl: false, meta: false }, // Enter (Submit)
  '\n': { name: 'enter', shift: true, ctrl: false, meta: false }, // Shift+Enter (Newline)
  '\x1b\r': { name: 'enter', shift: false, ctrl: false, meta: true }, // Alt+Enter (Newline)
  '\x7f': { name: 'backspace', shift: false, ctrl: false, meta: false },
  '\b': { name: 'backspace', shift: false, ctrl: false, meta: false },
  '\x1b[A': { name: 'up', shift: false, ctrl: false, meta: false },
  '\x1b[B': { name: 'down', shift: false, ctrl: false, meta: false },
  '\x1b[C': { name: 'right', shift: false, ctrl: false, meta: false },
  '\x1b[D': { name: 'left', shift: false, ctrl: false, meta: false },
  '\x1b[3~': { name: 'delete', shift: false, ctrl: false, meta: false },
};

export class InputParser extends EventEmitter {
  private buffer = '';
  private isPasting = false;
  private pasteBuffer = '';

  parse(data: Buffer) {
    const chunk = data.toString('utf8');
    this.buffer += chunk;

    while (this.buffer.length > 0) {
      const initialBufferLength = this.buffer.length;

      if (!this.isPasting && this.buffer.startsWith(PASTE_START)) {
        this.isPasting = true;
        this.pasteBuffer = '';
        this.buffer = this.buffer.slice(PASTE_START.length);
        continue;
      }

      if (this.isPasting && this.buffer.startsWith(PASTE_END)) {
        this.isPasting = false;
        this.emit('paste', this.pasteBuffer);
        this.pasteBuffer = '';
        this.buffer = this.buffer.slice(PASTE_END.length);
        continue;
      }

      if (this.isPasting) {
        this.pasteBuffer += this.buffer[0];
        this.buffer = this.buffer.slice(1);
        continue;
      }

      const matched = this.tryMatchSequence();
      if (!matched) {
        const char = this.buffer[0];
        if (!char) break;
        this.buffer = this.buffer.slice(1);

        if (char.charCodeAt(0) >= 32 && char !== '\x7f') {
          this.emit('key', {
            sequence: char,
            name: char,
            shift: false,
            ctrl: false,
            meta: false,
          });
        }
      }

      if (this.buffer.length === initialBufferLength) {
        break;
      }
    }
  }

  private tryMatchSequence(): boolean {
    const sequences = Object.keys(KEY_SEQUENCES).sort((a, b) => b.length - a.length);

    for (const seq of sequences) {
      if (this.buffer.startsWith(seq)) {
        this.emit('key', { sequence: seq, ...KEY_SEQUENCES[seq] });
        this.buffer = this.buffer.slice(seq.length);
        return true;
      }
    }

    if (this.buffer.startsWith('\x1b')) {
      const mightBeSequence = sequences.some(seq => seq.startsWith(this.buffer));
      if (mightBeSequence && this.buffer.length < 8) {
        return true;
      }

      if (this.buffer.length > 1) {
        const nextChar = this.buffer[1];
        this.emit('key', {
          sequence: this.buffer.slice(0, 2),
          name: nextChar,
          shift: false,
          ctrl: false,
          meta: true,
        });
        this.buffer = this.buffer.slice(2);
      } else {
        this.emit('key', {
          sequence: '\x1b',
          name: 'escape',
          shift: false,
          ctrl: false,
          meta: false,
        });
        this.buffer = this.buffer.slice(1);
      }
      return true;
    }

    return false;
  }
}

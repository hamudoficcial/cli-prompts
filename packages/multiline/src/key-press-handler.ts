import type { State } from "./state";

const isPrintable = (key: {
  ctrl: boolean;
  meta: boolean;
  sequence?: string;
}): boolean => {
  if (!key.sequence || key.ctrl || key.meta) {
    return false;
  }
  for (let i = 0; i < key.sequence.length; i++) {
    const code = key.sequence.charCodeAt(i);
    if ((code >= 0 && code <= 31) || code === 127) {
      return false;
    }
  }
  return true;
};

function deleteWord(state: State) {
  const line = state.value[state.cursor.y];
  const textBefore = line?.substring(0, state.cursor.x);
  if (textBefore?.length === 0 && state.cursor.y > 0) {
    const cl = state.value[state.cursor.y];
    const pl = state.value[state.cursor.y - 1];
    state.cursor.x = pl?.length ?? 0;
    state.value[state.cursor.y - 1] += cl ?? "";
    state.value.splice(state.cursor.y, 1);
    state.cursor.y--;
  } else {
    const lastSpace = (textBefore ?? "").trimEnd().lastIndexOf(" ");
    const newCursorX = lastSpace === -1 ? 0 : lastSpace + 1;
    state.value[state.cursor.y] =
      (textBefore?.substring(0, newCursorX) ?? "") +
      (line?.substring(state.cursor.x) ?? "");
    state.cursor.x = newCursorX;
  }
}

export function handleKeyPress(
  state: State,
  key: {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    sequence: string;
  }
) {
  // Clear any error on a valid text-modifying keypress.
  // Navigation keys are excluded so the user can move away while seeing the error.
  if (state.error && !["up", "down", "left", "right"].includes(key.name)) {
    state.error = null;
  }

  if (
    (key.name === "backspace" && key.meta) ||
    (key.name === "w" && key.ctrl)
  ) {
    deleteWord(state);
  } else {
    switch (key.name) {
      case "return":
        state.isDone = true;
        break;
      case "enter":
        {
          const currentLine = state.value[state.cursor.y] ?? "";
          const textAfterCursor = currentLine.substring(state.cursor.x);
          state.value[state.cursor.y] = currentLine.substring(
            0,
            state.cursor.x
          );
          state.value.splice(state.cursor.y + 1, 0, textAfterCursor);
          state.cursor.y++;
          state.cursor.x = 0;
        }
        break;
      case "backspace":
        if (state.cursor.x > 0) {
          const cl = state.value[state.cursor.y] ?? "";
          state.value[state.cursor.y] =
            cl.substring(0, state.cursor.x - 1) + cl.substring(state.cursor.x);
          state.cursor.x--;
        } else if (state.cursor.y > 0) {
          const cl = state.value[state.cursor.y] ?? "";
          const pl = state.value[state.cursor.y - 1] ?? "";
          state.cursor.x = pl.length;
          state.value[state.cursor.y - 1] += cl;
          state.value.splice(state.cursor.y, 1);
          state.cursor.y--;
        }
        break;
      case "delete":
        {
          const cl = state.value[state.cursor.y] ?? "";
          if (state.cursor.x < cl.length) {
            state.value[state.cursor.y] =
              cl.substring(0, state.cursor.x) +
              cl.substring(state.cursor.x + 1);
          } else if (state.cursor.y < state.value.length - 1) {
            state.value[state.cursor.y] += state.value[state.cursor.y + 1] ?? "";
            state.value.splice(state.cursor.y + 1, 1);
          }
        }
        break;
      case "up":
        if (state.cursor.y > 0) {
          state.cursor.y--;
          const lineLength = (state.value[state.cursor.y] ?? "").length;
          if (state.cursor.x > lineLength) {
            state.cursor.x = lineLength;
          }
        }
        break;
      case "down":
        if (state.cursor.y < state.value.length - 1) {
          state.cursor.y++;
          const lineLength = (state.value[state.cursor.y] ?? "").length;
          if (state.cursor.x > lineLength) {
            state.cursor.x = lineLength;
          }
        }
        break;
      case "left":
        {
          if (key.ctrl) {
            const line = state.value[state.cursor.y] ?? "";
            const textBefore = line.substring(0, state.cursor.x);
            const lastSpace = textBefore.trimEnd().lastIndexOf(" ");
            state.cursor.x = lastSpace === -1 ? 0 : lastSpace + 1;
          } else if (state.cursor.x > 0) {
            state.cursor.x--;
          } else if (state.cursor.y > 0) {
            state.cursor.y--;
            state.cursor.x = (state.value[state.cursor.y] ?? "").length;
          }
        }
        break;
      case "right":
        {
          if (key.ctrl) {
            const line = state.value[state.cursor.y] ?? "";
            const textAfter = line.substring(state.cursor.x);
            const match = textAfter.match(/\s\S/);
            if (match && typeof match.index === "number") {
              state.cursor.x += match.index + 1;
            } else {
              state.cursor.x = line.length;
            }
          } else if (state.cursor.x < (state.value[state.cursor.y] ?? "").length) {
            state.cursor.x++;
          } else if (state.cursor.y < state.value.length - 1) {
            state.cursor.y++;
            state.cursor.x = 0;
          }
        }
        break;
      default:
        if (isPrintable(key)) {
          const currentLength = state.value.join("\n").length;
          if (state.maxLength && currentLength >= state.maxLength) {
            state.error = `Input cannot exceed ${state.maxLength} characters.`;
          } else {
            const cl = state.value[state.cursor.y] ?? "";
            state.value[state.cursor.y] =
              cl.substring(0, state.cursor.x) +
              key.sequence +
              cl.substring(state.cursor.x);
            state.cursor.x += key.sequence!.length;
          }
        }
        break;
    }
  }

  // After any modification, check if a maxLength error should be cleared.
  if (state.maxLength && state.error?.includes("exceed")) {
    const newLength = state.value.join("\n").length;
    if (newLength < state.maxLength) {
      state.error = null;
    }
  }
}

import type { Style } from "./styles";

export interface State {
  prompt: string;
  instruction: string | false;
  placeholder?: string;
  spinner?: {
    frames: string[];
    currentFrame: number;
  };
  style: Style;
  value: string[];
  cursor: {
    x: number;
    y: number;
  };
  isDone: boolean;
  error: string | null;
  maxLength?: number;
}

export function createState(
  prompt: string,
  instruction: string | false,
  style: Style,
  defaultValue = "",
  placeholder?: string,
  maxLength?: number
): State {
  const value = defaultValue.split("\n");
  return {
    prompt,
    instruction,
    placeholder,
    style,
    value: defaultValue ? value : [""],
    cursor: {
      x: (value.at(-1) ?? "").length,
      y: defaultValue ? value.length - 1 : 0,
    },
    isDone: false,
    error: null,
    maxLength,
  };
}
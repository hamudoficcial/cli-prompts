// A simple color utility using ANSI escape codes.
export const color = {
  black: (str: string) => `\x1b[30m${str}\x1b[0m`,
  red: (str: string) => `\x1b[31m${str}\x1b[0m`,
  green: (str: string) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str: string) => `\x1b[33m${str}\x1b[0m`,
  blue: (str: string) => `\x1b[34m${str}\x1b[0m`,
  magenta: (str: string) => `\x1b[35m${str}\x1b[0m`,
  cyan: (str: string) => `\x1b[36m${str}\x1b[0m`,
  white: (str: string) => `\x1b[37m${str}\x1b[0m`,
  gray: (str: string) => `\x1b[90m${str}\x1b[0m`,
  bold: (str: string) => `\x1b[1m${str}\x1b[0m`,
};

export type ColorName = keyof typeof color;
export type ColorFn = (value: string) => string;

// The type for a color property provided by the user.
export type UserStyleColor = ColorFn | ColorName;

// The fully resolved style object that the renderer uses.
export type Style = {
  prefixes: {
    prompt: string;
    success: string;
    error: string;
    input: string;
  };
  colors: {
    prompt: ColorFn;
    success: ColorFn;
    error: ColorFn;
    instruction: ColorFn;
    placeholder: ColorFn;
    finalAnswer: ColorFn;
    inputPrefix: ColorFn;
    promptTitle: ColorFn;
  };
};

// A more explicit type for the user-provided 'colors' object.
type UserColors = Partial<{
  prompt: UserStyleColor;
  success: UserStyleColor;
  error: UserStyleColor;
  instruction: UserStyleColor;
  placeholder: UserStyleColor;
  finalAnswer: UserStyleColor;
  inputPrefix: UserStyleColor;
  promptTitle: UserStyleColor;
}>;

// The type for the user-facing 'style' option object.
export type UserOptionsStyle = Partial<{
  prefixes: Partial<Style['prefixes']>;
  colors: UserColors;
}>;

// The default style configuration.
export const defaultStyle: Style = {
  prefixes: {
    prompt: '?',
    success: '✔',
    error: '✖',
    input: '›',
  },
  colors: {
    prompt: color.cyan,
    success: color.green,
    error: color.red,
    instruction: color.gray,
    placeholder: color.gray,
    finalAnswer: color.cyan,
    inputPrefix: color.gray,
    promptTitle: color.bold,
  },
};

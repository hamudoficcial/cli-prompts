# @cli-prompts/multiline

[![npm version](https://badge.fury.io/js/@cli-prompts%2Fmultiline.svg)](https://badge.fury.io/js/@cli-prompts%2Fmultiline) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, flicker-free, feature-rich multiline text input for your command-line applications.

Have you ever been frustrated that `inquirer` and other great libraries are missing a proper, smooth multiline text input? This package solves that. It's a standalone component designed from the ground up to provide a first-class "textarea" experience in the terminal.

![Multiline Demo GIF](https://github.com/PRASSamin/cli-prompts/blob/0d04be4dae4548bbd30a08ae2233720a3f1eda37/packages/multiline/demo.gif?raw=true)

## ✨ Features

- **True Multiline Editing:** A native-like textarea experience in the terminal.
- **Intuitive Key-bindings:** `Enter` to submit, `Shift+Enter` for newlines.
- **Advanced Editing:** Word-wise navigation (`Ctrl+Left/Right`) and deletion (`Alt+Backspace`, `Ctrl+W`).
- **Robust Paste Support:** Reliably paste multi-line text without accidentally submitting.
- **Rich Feature Set:** Supports placeholders, default values, validation, and max length.
- **Animated Spinners:** Optional loading spinner for a dynamic feel.
- **Deeply Customizable:** Change prefixes, colors, and more with a simple style object.
- **Flicker-Free:** Built with a smart, atomic render loop.
- **Lightweight & Modern:** Zero runtime dependencies, written in TypeScript.
- **Battle-Tested:** High unit test coverage.

## 📦 Installation

```bash
# pnpm
pnpm add @cli-prompts/multiline

# npm
npm install @cli-prompts/multiline

# yarn
yarn add @cli-prompts/multiline

# bun
bun add @cli-prompts/multiline
```

## 🚀 Usage

```javascript
import { multiline, AbortError } from '@cli-prompts/multiline';

async function main() {
  try {
    const description = await multiline({
      prompt: 'Please enter your project description:',
      placeholder: 'My project is about...\nIt does really cool things!',
    });

    console.log('\nYour description:\n ', description);
  } catch (error) {
    if (error instanceof AbortError) {
      // The user aborted the prompt (Ctrl+C).
      // The component already printed a cancellation message.
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

main();
```

## ⚙️ API & Options

The `multiline` function accepts a string for a simple prompt, or an options object for full configuration.

`multiline(options: MultilineOptions): Promise<string>`

| Option        | Type                                   | Default      | Description                                                                                               |
| ------------- | -------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `prompt`      | `string`                               | **Required** | The main question to ask the user.                                                                        |
| `default`     | `string`                               | `''`         | A default value to pre-populate the input with. Supports `\n` for newlines.                               |
| `placeholder` | `string`                               | `undefined`  | Placeholder text to show when the input is empty. Supports `\n` for newlines.                             |
| `instruction` | `string \| boolean`                    | `true`       | A help message shown below the input. Set to `false` to hide, or a string to override.                    |
| `required`    | `boolean`                              | `false`      | If `true`, prevents submission if the input is empty or only whitespace.                                  |
| `validate`    | `(value: string) => boolean \| string` | `undefined`  | A function to validate the input on submission. Return `true` if valid, or a string for an error message. |
| `maxLength`   | `number`                               | `undefined`  | The maximum number of characters allowed. Provides real-time feedback.                                    |
| `spinner`     | `boolean`                              | `false`      | If `true`, replaces the `?` prefix with an animated spinner.                                              |
| `style`       | `object`                               | `{...}`      | An object to customize prefixes and colors. See "Styling" section below.                                  |

## 🎨 Styling

You can customize the look and feel by passing a `style` object. You only need to provide the properties you want to override.

**Example:**

```javascript
import chalk from 'chalk';

multiline({
  prompt: 'Enter commit message',
  style: {
    prefixes: {
      prompt: '🤔',
      success: '✅',
    },
    colors: {
      prompt: 'yellow', // Use a predefined color name
      finalAnswer: str => chalk.italic.hex('#888')(str), // Or use a custom function
    },
  },
});
```

**Style Object Structure:**

```typescript
{
  prefixes?: {
    prompt?: string;    // default: '?'
    success?: string;   // default: '✔'
    error?: string;     // default: '✖'
    input?: string;     // default: '›'
  };
  colors?: {
    prompt?: ColorFn | ColorName;      // default: 'cyan'
    success?: ColorFn | ColorName;     // default: 'green'
    error?: ColorFn | ColorName;       // default: 'red'
    instruction?: ColorFn | ColorName; // default: 'gray'
    placeholder?: ColorFn | ColorName; // default: 'gray'
    finalAnswer?: ColorFn | ColorName; // default: 'cyan'
    inputPrefix?: ColorFn | ColorName; // default: 'gray'
    promptTitle?: ColorFn | ColorName; // default: 'bold'
  };
}
```

_`ColorName` can be one of: `'black'`, `'red'`, `'green'`, `'yellow'`, `'blue'`, `'magenta'`, `'cyan'`, `'white'`, `'gray'`. `ColorFn` is a function `(str: string) => string`._

## ⌨️ Key Bindings

| Key                                 | Action                 |
| ----------------------------------- | ---------------------- |
| `Enter`                             | Submit the input       |
| `Shift` + `Enter` / `Alt` + `Enter` | Insert a new line      |
| `Ctrl` + `C`                        | Abort the prompt       |
| `Backspace`                         | Delete character left  |
| `Delete`                            | Delete character right |
| `Alt` + `Backspace`                 | Delete word left       |
| `Ctrl` + `W`                        | Delete word left       |
| `Arrow Keys`                        | Move cursor            |
| `Ctrl` + `Left`                     | Move to previous word  |
| `Ctrl` + `Right`                    | Move to next word      |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

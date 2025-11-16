# ✨ Modern CLI Prompts

A collection of beautiful, modern, and essential components for building next-generation interactive command-line applications.

This project was born out of a simple frustration: building great CLI experiences should be easier. While there are many amazing libraries out there, some fundamental pieces are often missing or outdated. Our goal is to create a suite of lightweight, zero-dependency, and fully-tested components that just work.

## 📦 Packages

This is a monorepo containing the following packages:

| Package                                          | Description                                                                      | Version                                                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`@cli-prompts/multiline`](./packages/multiline) | A flicker-free, feature-rich multiline text input. The one you've always wanted. | [![npm version](https://badge.fury.io/js/@cli-prompts%2Fmultiline.svg)](https://badge.fury.io/js/@cli-prompts%2Fmultiline) |
| _...more to come!_                               |                                                                                  |                                                                                                                            |

## философия (Our Philosophy)

- **Modern:** Built with TypeScript and modern architecture. No legacy code.
- **Lightweight:** Zero runtime dependencies. Keep your `node_modules` slim.
- **Developer Experience:** Simple APIs, great documentation, and easy to integrate.
- **User Experience:** Smooth, flicker-free, and intuitive interfaces for the end-user.
- **Battle-Tested:** High test coverage to ensure reliability.

## 🚀 Getting Started (For Developers)

This project is managed as a pnpm monorepo.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/PRASSamin/cli-prompts.git
    cd cli-prompts
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Run tests:**
    To run the test suite for all packages:

    ```bash
    pnpm test
    ```

4.  **Build all packages:**
    To build all packages for publishing:
    ```bash
    pnpm build
    ```

## 🤝 Contributing

We'd love for you to contribute! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

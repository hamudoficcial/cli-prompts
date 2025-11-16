import { defineConfig, type Options } from 'tsup';

const config = (options?: Partial<Options>) =>
  defineConfig({
    tsconfig: './tsconfig.json',
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    bundle: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    target: 'esnext',
    skipNodeModulesBundle: true,
    onSuccess: async () => {
      console.log('Build completed successfully!');
    },
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.mjs',
      };
    },
    ...options,
  });

export default config;

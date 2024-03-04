import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import path from 'path';
import copy from 'rollup-plugin-copy-merge';

export default defineConfig({
  plugins: [
    copy({
      targets: [
        {
          src: './node_modules/@emoji-mart/data/sets/14/native.json',
          dest: fileURLToPath(
            new URL('../../src/main/resources/static/emoji', import.meta.url)
          ),
        },
      ],
      verbose: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env': process.env,
  },
  build: {
    outDir: fileURLToPath(
      new URL('../../src/main/resources/static', import.meta.url)
    ),
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['iife'],
      name: 'CommentWidget',
      fileName: (format) => `comment-widget.${format}.js`,
    },
    sourcemap: false,
  },
});

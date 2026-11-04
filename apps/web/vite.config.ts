import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { createHtmlPlugin } from 'vite-plugin-html';
import Path from 'path';

import { alias } from './aliases';

const PATHS = {
  output: Path.join(__dirname, './dist'),
  source: Path.join(__dirname, './src'),
  fixed: '/',
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname);

  return {
    root: PATHS.source,
    base: PATHS.fixed,
    publicDir: 'assets',
    envDir: __dirname,
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      createHtmlPlugin({
        minify: true,
        /**
         * After writing entry here, you will not need to add script tags in `index.html`, the original tags need to be deleted
         * @default /app/App.tsx
         */
        entry: '/app/App.tsx',
        template: 'index.html',
      }),
    ],
    define: {
      'process.env.APP_ENV': JSON.stringify(env.VITE_APP_ENV),
    },
    resolve: {
      alias,
    },
    build: {
      outDir: PATHS.output,
    },
  };
});

/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import dotenv from 'dotenv'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

dotenv.config()

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  // import.meta.env.VITE_PORT available here with: process.env.VITE_PORT

  return defineConfig({
    plugins: [react(), tsconfigPaths(), dynamicImport({})],

    server: {
      port: Number(process.env.VITE_PORT) || 3000,
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      },
    },
    define: {
      'process.env.VITE_BACKEND_API': `"${process.env.VITE_BACKEND_API}"`,
      'process.env.VITE_BUILD_NUMBER': `"${process.env.VITE_BUILD_NUMBER}"`,
      'process.env.NODE_ENV': `"${mode}"`,
      // 'process.env.VITE_PORT': `"${process.env.VITE_PORT}"`,
    },
    // root: './src',
    build: {
      outDir: './build',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          // nested: resolve(__dirname, 'nested/index.html')
        },
        external: ['src/index.tsx'],
      },
      dynamicImportVarsOptions: {
        exclude: [],
      },
    },
    test: {
      globals: true,
      environmentOptions: {
        jsdom: {
          console: true,
        },
      },
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'src/setupTests.ts'],
      },
      // transformMode: {
      //   web: [/\.[jt]sx$/],
      // },
    },
  })
}

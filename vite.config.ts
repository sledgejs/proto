import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {

  return {
    plugins: [
      splitVendorChunkPlugin(),
      react({
        babel: {
          parserOpts: {
            plugins: ['decorators-legacy'],
          }
        }
      })
    ],

    define: {
      'process.env': process.env
    },

    server: {
      port: 3000
    },

    build: {
      commonjsOptions: {
        include: [
          /node_modules/
        ],
        transformMixedEsModules: true
      },
      reportCompressedSize: true,

      rollupOptions: {
        output: {
          manualChunks: {
            core: [
              'lodash',
              'react',
              'react-dom',
              'react-router-dom',
              'mobx',
              'mobx-react-lite'
            ]
          }
        }
      },
      minify: true
    },

    test: {
      globals: true,
      environment: 'jsdom',
      define: {
        _TEST_: true
      }
    }
  }
})
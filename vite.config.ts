import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode, command, isPreview }) => {
  const hardwareTarget = loadEnv(
    mode,
    process.cwd(),
    '',
  ).VITE_HARDWARE_API_BASE_URL;
  return {
    plugins: [
      react(),
      tailwindcss(),
      command === 'serve' &&
        !isPreview &&
        basicSsl({ certDir: '.cache/dev-ssl' }),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 8000,
      strictPort: true,
      host: true,
      proxy: hardwareTarget
        ? {
            '^/device-api/api/passport/(info|read|stop)$': {
              target: hardwareTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/device-api/, ''),
              bypass: (request) => {
                return request.method === 'GET' ? undefined : false;
              },
              configure: (proxy) => {
                proxy.on('proxyReq', (request) =>
                  request.removeHeader('origin'),
                );
              },
            },
          }
        : undefined,
    },

    preview: { port: 4173, strictPort: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'tests/*.test.tsx'],
      clearMocks: true,
      restoreMocks: true,
    },
  };
});

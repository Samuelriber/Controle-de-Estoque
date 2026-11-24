import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND = 'http://localhost:8080';

function configurarProxy(proxy) {
  // Pelo proxy a chamada é de mesma origem; sem isso o CORS do Spring recusa origens como 127.0.0.1:5173
  proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'));

  // Com o backend fora do ar o proxy responde 502, e o front trata como erro de rede
  proxy.on('error', (_erro, _req, res) => {
    if (res.writeHead && !res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Backend indisponível');
    }
  });
}

const rotaApi = { target: BACKEND, changeOrigin: true, configure: configurarProxy };

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/mercadorias': rotaApi,
      '/estoques': rotaApi,
    },
  },
});

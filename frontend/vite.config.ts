import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
      resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
  server: { // 👈 server 객체를 추가합니다.
    port: 5173,
    proxy: {
      // '/api'로 시작하는 요청은 전부 target으로 프록시(대신 요청을 보내줌)
      '/api': {
        // Spring Boot 서버의 주소
        target: 'http://localhost:8080',
        // 출처(Origin)를 target 주소에 맞게 변경
        changeOrigin: true,
        cookieDomainRewrite: ""
      },
      '/chat-manager/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                cookieDomainRewrite: ""
      },
    },
  },
});
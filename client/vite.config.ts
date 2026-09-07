// Vite 설정을 안전하게 작성하도록 돕는 함수를 가져옵니다.
import { defineConfig } from "vite";
// Vite에서 React와 JSX를 처리하게 하는 플러그인입니다.
import react from "@vitejs/plugin-react";

// Vite 개발 서버와 빌드 도구의 설정을 내보냅니다.
export default defineConfig({
  // React 문법을 이해할 수 있도록 플러그인을 등록합니다.
  plugins: [react()],
  // 개발 서버에만 적용되는 설정입니다.
  server: {
    // 브라우저에서 접속할 개발 서버 포트 번호입니다.
    port: 5173,
  },
});

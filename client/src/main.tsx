// 개발 중 문제를 더 잘 찾게 해 주는 React 검사 모드를 가져옵니다.
import { StrictMode } from "react";
// HTML 안에 React 화면을 붙이는 도구를 가져옵니다.
import { createRoot } from "react-dom/client";
// 이 앱의 메인 화면 컴포넌트를 가져옵니다.
import App from "./App";
// 모든 화면에 공통으로 적용할 CSS를 가져옵니다.
import "./index.css";

// index.html의 root 영역을 찾아 React가 화면을 그릴 시작점을 만듭니다.
createRoot(document.getElementById("root")!).render(
  // 개발 중 실수를 더 엄격히 검사하도록 앱을 감쌉니다.
  <StrictMode>
    {/* 실제 날씨 조회 화면을 표시합니다. */}
    <App />
  </StrictMode>
);

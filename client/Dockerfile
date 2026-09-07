# React 앱을 정적 파일로 빌드하는 Node.js 환경입니다.
FROM node:20-alpine AS build

# 컨테이너 안에서 작업할 폴더입니다.
WORKDIR /app

# 먼저 의존성 목록을 복사합니다.
COPY package*.json ./

# package-lock.json에 고정된 버전으로 라이브러리를 설치합니다.
RUN npm ci

# 앱 소스와 Vite 설정을 복사합니다.
COPY . ./

# .env.production의 Cloud Run API 주소를 포함한 정적 파일을 만듭니다.
RUN npm run build

# 빌드 결과물을 빠르게 제공할 Nginx 웹 서버입니다.
FROM nginx:1.27-alpine

# Cloud Run이 전달하는 8080 포트를 사용하도록 Nginx를 설정합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 앞 단계에서 만든 React 정적 파일을 웹 서버 폴더에 넣습니다.
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run이 요청을 전달할 포트입니다.
EXPOSE 8080

# Nginx를 컨테이너의 메인 프로세스로 실행합니다.
CMD ["nginx", "-g", "daemon off;"]
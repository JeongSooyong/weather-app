# Node.js 20 환경에서 서버를 빌드합니다.
FROM node:20-alpine AS build

# 컨테이너 안에서 작업할 폴더입니다.
WORKDIR /app

# 의존성 목록을 먼저 복사해 설치 결과를 재사용하기 쉽게 합니다.
COPY package*.json ./

# package-lock.json에 고정된 버전으로 의존성을 설치합니다.
RUN npm ci

# TypeScript 원본 코드와 컴파일 설정을 복사합니다.
COPY tsconfig.json ./
COPY src ./src

# TypeScript 서버 코드를 실행 가능한 JavaScript로 변환합니다.
RUN npm run build

# 실제 서비스 실행에 필요한 작은 Node.js 환경을 새로 만듭니다.
FROM node:20-alpine

# 컨테이너 안에서 작업할 폴더입니다.
WORKDIR /app

# 실행에 필요한 의존성 목록을 복사합니다.
COPY package*.json ./

# 개발 도구 없이 서비스 실행에 필요한 패키지만 설치합니다.
RUN npm ci --omit=dev

# 앞 단계에서 만들어진 JavaScript 결과물을 가져옵니다.
COPY --from=build /app/dist ./dist

# Cloud Run이 전달하는 PORT 환경 변수를 서버가 사용합니다.
ENV PORT=8080

# Cloud Run이 서버에 요청을 전달할 포트입니다.
EXPOSE 8080

# Express API 서버를 시작합니다.
CMD ["npm", "start"]
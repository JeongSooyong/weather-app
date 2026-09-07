# 날씨 조회 앱 (React + Node.js)

도시 이름을 입력하면 현재 날씨를 보여주는 앱. **Open-Meteo**(무료, API 키 불필요)를
외부 API로 연동하는 패턴을 연습하기 위한 토이프로젝트입니다.
<br>
클라이언트 측에서 도시를 입력하면 그에 맞게 지오API에서 도시의 좌표를 불러옵니다. 
<br>
그리고 그 좌표에 맞는 날씨정보를 지오API와는 별개의 날씨API에서 해당 좌표(도시)에 맞는 날씨정보를 가져옵니다.
<br>
마지막으로 해당 정보를 클라이언트에 응답시켜주는 구조입니다.
<br>
해당 앱을 보완하기 위해 LA, NYC 등 일상에서 흔히 쓰는 도시의 약어를 해석하기 위해 OPEN AI를 사용했습니다.

## 구조

```
weather-app/
├── server/               # Node.js + Express + TypeScript API 서버
│   └── src/
│       ├── server.ts       # GET /api/weather?city=서울
│       └── weatherService.ts  # Open-Meteo 지오 + 날씨 조회
└── client/                # React + Vite + TypeScript 프론트엔드
    └── src/
        ├── App.tsx           # 검색창 + 날씨 카드 UI
        └── types.ts           # API 응답 타입
```

백엔드와 프론트엔드가 완전히 분리된 구조로, 백엔드는 순수 API 서버(JSON만
반환)이고 프론트는 그걸 fetch로 불러와 화면을 그립니다.

## 실행 방법

**사전 요구사항**: Node.js 18 이상 (전역 `fetch` 내장 여부 때문에 필요)

### 1. 서버 실행

```bash
cd server
npm install
copy .env.example .env      # Windows / cp .env.example .env (macOS/Linux)
npm run dev
```

`http://localhost:4000` 에서 API 서버가 뜹니다.

### 2. 클라이언트 실행 (새 터미널)

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

`http://localhost:5173` 접속하면 화면이 뜹니다.

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/weather?city=서울` | 도시 이름으로 현재 날씨 조회 |

응답 예시:
```json
{
  "location": { "name": "Seoul", "admin1": "Seoul", "country": "South Korea" },
  "weather": {
    "temperature": 24.3,
    "apparentTemperature": 25.1,
    "humidity": 61,
    "windSpeed": 9.4,
    "precipitation": 0,
    "weatherCode": 1,
    "description": "대체로 맑음",
    "emoji": "🌤️",
    "observedAt": "2026-09-06T15:00"
  }
}
```

## 설계 포인트

- **외부 API 2단계 연동**: 도시 이름 → 좌표(지오코딩 API) → 그 좌표로 날씨 조회
  (2차 API 호출)라는, 실무에서 자주 나오는 "API 체이닝" 패턴을 그대로 담았습니다.
- **관심사 분리**: `weatherService.ts`에 외부 API 호출 로직을 모아두고,
  `server.ts`는 라우팅/에러 응답만 담당하도록 나눴습니다.
- **CORS 설정**: 프론트(5173)와 백엔드(4000) 포트가 다르므로 `cors` 미들웨어로
  `CLIENT_ORIGIN`만 허용하도록 구성했습니다.

## 확장 아이디어

- 5일 예보(`daily` 파라미터 추가)까지 보여주기
- 최근 검색한 도시 목록을 로컬 스토리지에 저장
- 즐겨찾기 도시 등록 기능 (DB 필요 시 URL 단축기 프로젝트의 PostgreSQL 구조 재사용 가능)
- 배포 시 `server`는 Render/Railway, `client`는 Vercel/Netlify에 각각 배포

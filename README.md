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

`LA`, `NYC` 같은 도시 약어를 자동으로 정확한 장소로 해석하려면 서버의 `.env`에
`OPENAI_API_KEY`를 설정합니다. 이 키는 서버에서만 사용하며 GitHub에 올리지 않습니다.
키가 없거나 OpenAI 호출에 실패한 경우에도 기존 도시 검색은 그대로 동작합니다.

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

## 배포: Render + Vercel

이 프로젝트는 서버와 화면을 각각 배포합니다. API 키는 GitHub에 올리지 않고 각
배포 서비스의 환경 변수 화면에서만 입력합니다.

### 1. API 서버를 Render에 배포

1. [Render](https://render.com)에서 GitHub 계정으로 로그인한 뒤 **New +** →
  **Blueprint**를 선택합니다.
2. `JeongSooyong/weather-app` 저장소를 선택합니다. 저장소 최상단의
  `render.yaml`을 Render가 읽어 서버 설정을 자동으로 만듭니다.
3. 환경 변수 입력 화면에서 다음 값을 설정합니다.

  | 이름 | 값 |
  |---|---|
  | `CLIENT_ORIGIN` | Vercel에서 발급받을 화면 주소. 처음에는 임시 주소여도 됩니다. |
  | `OPENAI_API_KEY` | 선택 사항. 도시 약어를 LLM으로 해석할 OpenAI API 키 |

4. 배포가 끝나면 `https://weather-app-api.onrender.com`처럼 표시되는 API 주소를
  복사합니다. 실제 주소는 Render 대시보드에서 확인합니다.

### 2. 화면을 Vercel에 배포

1. [Vercel](https://vercel.com)에서 GitHub 계정으로 로그인한 뒤 **Add New** →
  **Project**를 선택합니다.
2. `JeongSooyong/weather-app` 저장소를 Import합니다.
3. **Root Directory**를 `client`로 지정합니다. Framework Preset은 `Vite`를
  선택하거나 자동 감지를 그대로 둡니다.
4. 환경 변수에 아래 값을 추가합니다. 값에는 1단계에서 복사한 실제 Render 주소를
  넣고, 끝의 `/`는 붙이지 않습니다.

  | 이름 | 값 |
  |---|---|
  | `VITE_API_URL` | `https://실제-Render-서버-주소` |

5. **Deploy**를 누릅니다. 배포가 끝나면 Vercel 화면 주소를 복사합니다.

### 3. CORS 주소 완성 및 재배포

Render 환경 변수 `CLIENT_ORIGIN`을 2단계의 실제 Vercel 주소로 바꾸고 저장합니다.
그다음 Vercel에서 **Redeploy**를 실행합니다. 이제 배포된 화면에서 API 서버로
날씨 요청을 보낼 수 있습니다.

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

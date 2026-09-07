// 웹 주소로 들어온 요청을 처리하는 Express 도구를 가져옵니다.
import express, { Request, Response } from "express";
// 다른 주소에서 온 브라우저 요청을 허용하는 CORS 도구입니다.
import cors from "cors";
// .env 파일에 적은 설정값을 읽는 도구입니다.
import dotenv from "dotenv";

// 도시를 좌표로 바꾸고 날씨를 가져오는 함수를 불러옵니다.
import { geocodeCity, fetchCurrentWeather } from "./weatherService";

// 프로젝트 폴더의 .env 설정 파일을 읽어 process.env에 넣습니다.
dotenv.config();

// 웹 API 서버 앱을 만듭니다.
const app = express();
// .env의 PORT가 있으면 사용하고, 없으면 4000번 포트를 사용합니다.
const PORT = process.env.PORT || 4000;
// 이 주소의 프론트엔드만 서버에 요청할 수 있도록 기본값을 정합니다.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// 브라우저 보안 정책 때문에 필요한 다른 출처 요청 허용 설정입니다.
app.use(cors({ origin: CLIENT_ORIGIN }));
// JSON 형식으로 들어오는 요청 내용을 읽을 수 있게 준비합니다.
app.use(express.json());

/**
 * GET /api/weather?city=서울
 * 도시 이름을 좌표로 변환한 뒤, 그 좌표의 현재 날씨를 반환합니다.
 */
app.get("/api/weather", async (req: Request, res: Response) => {
  // 주소의 ?city=서울 부분을 읽고, 앞뒤 공백을 없앱니다.
  const city = (req.query.city as string | undefined)?.trim();

  // 도시 이름이 없으면 잘못된 요청(400)이라고 알려 줍니다.
  if (!city) {
    return res.status(400).json({ error: "city 쿼리 파라미터가 필요합니다. 예: /api/weather?city=서울" });
  }

  try {
    // 도시 이름을 위도와 경도로 바꿉니다.
    const location = await geocodeCity(city);
    // 해당 도시를 찾지 못하면 찾을 수 없음(404)이라고 답합니다.
    if (!location) {
      return res.status(404).json({ error: `"${city}"에 해당하는 위치를 찾을 수 없습니다.` });
    }

    // 찾은 위도와 경도를 이용해 현재 날씨 정보를 가져옵니다.
    const weather = await fetchCurrentWeather(location.latitude, location.longitude);

    // 프론트엔드가 쓰기 편한 모양으로 위치와 날씨를 묶어 JSON으로 보냅니다.
    return res.json({
      location: {
        name: location.name,
        // 행정 구역 정보가 없으면 null을 보내 항상 같은 데이터 모양을 유지합니다.
        admin1: location.admin1 ?? null,
        country: location.country,
      },
      weather,
    });
  } catch (err) {
    // 개발자가 원인을 확인할 수 있게 서버 콘솔에 오류를 기록합니다.
    console.error("[GET /api/weather] 오류:", err);
    // 외부 날씨 서비스 등의 예상하지 못한 오류는 서버 오류(500)로 답합니다.
    return res.status(500).json({ error: "날씨 정보를 가져오는 중 오류가 발생했습니다." });
  }
});

// 지정한 포트에서 웹 서버를 시작합니다.
app.listen(PORT, () => {
  // 서버 주소를 콘솔에 보여 줍니다.
  console.log(`날씨 API 서버 실행 중: http://localhost:${PORT}`);
  // 요청을 허용한 프론트엔드 주소를 콘솔에 보여 줍니다.
  console.log(`CORS 허용 origin: ${CLIENT_ORIGIN}`);
});

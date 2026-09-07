// 화면의 값을 기억하고, 폼 제출을 처리하기 위한 React 도구를 가져옵니다.
import { useState, FormEvent } from "react";
// 서버가 보내는 날씨 정보와 오류 정보의 모양을 가져옵니다.
import type { WeatherResponse, ApiError } from "./types";
// 이 화면에 적용할 CSS 디자인 파일을 불러옵니다.
import "./App.css";

// .env에 적은 서버 주소를 사용하고, 없으면 내 컴퓨터의 4000번 서버를 사용합니다.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// 날씨 조회 화면 전체를 만드는 React 컴포넌트입니다.
export default function App() {
  // 입력창에 현재 적힌 도시 이름을 기억합니다.
  const [city, setCity] = useState("");
  // 서버에서 받은 날씨 정보를 기억합니다. 아직 없으면 null입니다.
  const [data, setData] = useState<WeatherResponse | null>(null);
  // 서버에 요청하는 동안 버튼과 문구 상태를 바꾸기 위한 값입니다.
  const [loading, setLoading] = useState(false);
  // 문제가 생겼을 때 사용자에게 보여 줄 오류 문구입니다.
  const [error, setError] = useState<string | null>(null);

  // 조회 버튼을 누르거나 Enter 키를 눌렀을 때 실행됩니다.
  async function handleSearch(e: FormEvent) {
    // 브라우저가 폼을 제출하며 페이지를 새로 고치는 기본 동작을 막습니다.
    e.preventDefault();
    // 입력값 앞뒤의 불필요한 공백을 제거합니다.
    const trimmed = city.trim();
    // 아무 도시도 입력하지 않았다면 서버에 요청하지 않고 끝냅니다.
    if (!trimmed) return;

    // 요청이 시작됐음을 표시해 버튼에 '조회 중...'을 보여 줍니다.
    setLoading(true);
    // 이전에 보이던 오류 메시지를 지웁니다.
    setError(null);
    // 이전 검색 결과를 지워 새 결과와 섞이지 않게 합니다.
    setData(null);

    try {
      // 도시 이름을 안전한 주소 문자로 바꿔 백엔드 날씨 API에 요청합니다.
      const res = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(trimmed)}`);
      // 서버가 보낸 JSON 형식의 답변을 자바스크립트 데이터로 읽습니다.
      const json = await res.json();

      // 서버가 200번대 성공 응답이 아닌 경우 오류 메시지를 화면에 남깁니다.
      if (!res.ok) {
        // 서버의 오류 문구가 있으면 사용하고, 없으면 기본 문구를 사용합니다.
        setError((json as ApiError).error || "날씨 정보를 가져오지 못했습니다.");
        // 실패한 경우 아래의 성공 처리로 진행하지 않습니다.
        return;
      }

      // 정상적으로 받은 날씨 정보를 상태에 저장해 화면을 다시 그리게 합니다.
      setData(json as WeatherResponse);
    } catch (err) {
      // 인터넷 또는 서버 연결 자체가 실패했을 때의 메시지입니다.
      setError("서버에 연결할 수 없습니다.");
    } finally {
      // 성공과 실패 모두에서 요청 중 상태를 끝냅니다.
      setLoading(false);
    }
  }

  // 아래 JSX는 브라우저에 실제로 보이는 화면 구조입니다.
  return (
    // 화면 전체를 감싸고 중앙 정렬과 배경을 담당합니다.
    <div className="page">
      <div className="card">
        {/* 화면의 제목입니다. */}
        <h1>🌦️ 날씨 조회</h1>
        {/* 사용 방법을 짧게 안내합니다. */}
        <p className="subtitle">도시 이름을 입력하면 현재 날씨를 보여드려요.</p>

        {/* 제출되면 handleSearch 함수를 실행하는 검색 양식입니다. */}
        <form onSubmit={handleSearch} className="search-form">
          {/* value는 city와 연결되고, 입력할 때마다 setCity가 city를 갱신합니다. */}
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="예: 서울, 부산, Tokyo, Paris"
          />
          {/* 요청 중에는 중복 요청을 막기 위해 버튼을 비활성화합니다. */}
          <button type="submit" disabled={loading}>
            {/* loading 값에 따라 버튼 글자를 바꿉니다. */}
            {loading ? "조회 중..." : "조회"}
          </button>
        </form>

        {/* 오류 문구가 있을 때에만 오류 영역을 표시합니다. */}
        {error && <div className="error">{error}</div>}

        {/* 성공적으로 받은 날씨 데이터가 있을 때에만 결과 영역을 표시합니다. */}
        {data && (
          <div className="result">
            {/* 도시명, 행정 구역, 국가를 표시합니다. */}
            <div className="location">
              {data.location.name}
              {data.location.admin1 ? `, ${data.location.admin1}` : ""} ({data.location.country})
            </div>
            {/* 날씨 상태를 나타내는 아이콘입니다. */}
            <div className="emoji">{data.weather.emoji}</div>
            {/* 온도를 반올림해서 섭씨 단위로 표시합니다. */}
            <div className="temperature">{Math.round(data.weather.temperature)}°C</div>
            {/* '맑음', '비' 같은 날씨 설명을 표시합니다. */}
            <div className="description">{data.weather.description}</div>

            {/* 네 가지 상세 정보를 두 칸짜리 격자로 배치합니다. */}
            <div className="detail-grid">
              {/* 첫 번째 상세 정보인 체감온도입니다. */}
              <div className="detail-item">
                <span className="label">체감온도</span>
                <span className="value">{Math.round(data.weather.apparentTemperature)}°C</span>
              </div>
              {/* 두 번째 상세 정보인 습도입니다. */}
              <div className="detail-item">
                <span className="label">습도</span>
                <span className="value">{data.weather.humidity}%</span>
              </div>
              {/* 세 번째 상세 정보인 풍속입니다. */}
              <div className="detail-item">
                <span className="label">풍속</span>
                <span className="value">{data.weather.windSpeed} km/h</span>
              </div>
              {/* 네 번째 상세 정보인 강수량입니다. */}
              <div className="detail-item">
                <span className="label">강수량</span>
                <span className="value">{data.weather.precipitation} mm</span>
              </div>
            </div>

            {/* 날씨를 측정한 시각을 사용자의 지역 형식에 맞춰 표시합니다. */}
            <div className="observed-at">
              관측 시각: {new Date(data.weather.observedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

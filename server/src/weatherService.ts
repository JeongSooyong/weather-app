/**
 * weatherService.ts
 * Open-Meteo(무료, API 키 불필요)를 이용해 도시 이름 → 좌표 변환(지오코딩) 후
 * 해당 좌표의 현재 날씨를 조회합니다.
 *
 * 참고: Node.js 18 이상이면 fetch가 전역으로 내장되어 있어 별도 라이브러리가 필요 없습니다.
 */

// 도시 이름으로 위치를 찾는 Open-Meteo의 주소입니다.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
// 위도와 경도로 현재 날씨를 가져오는 Open-Meteo의 주소입니다.
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// 한글 주요 도시를 외부 서비스가 더 잘 찾는 영문 검색어로 바꿉니다.
const KOREAN_CITY_QUERY_MAP: Record<string, string> = {
  "서울": "Seoul",
  "서울특별시": "Seoul",
  "부산": "Busan",
  "부산광역시": "Busan",
  "대구": "Daegu",
  "인천": "Incheon",
  "광주": "Gwangju",
  "대전": "Daejeon",
  "울산": "Ulsan",
  "세종": "Sejong",
  "제주": "Jeju",
  "제주시": "Jeju",
};

// 외부 서비스의 숫자 날씨 코드를 사람이 읽을 한글 설명과 아이콘으로 바꿉니다.
// 숫자의 뜻은 WMO(세계기상기구) 날씨 코드 기준입니다.
const WEATHER_CODE_MAP: Record<number, { description: string; emoji: string }> = {
  0: { description: "맑음", emoji: "☀️" },
  1: { description: "대체로 맑음", emoji: "🌤️" },
  2: { description: "부분적으로 흐림", emoji: "⛅" },
  3: { description: "흐림", emoji: "☁️" },
  45: { description: "안개", emoji: "🌫️" },
  48: { description: "짙은 안개(서리)", emoji: "🌫️" },
  51: { description: "약한 이슬비", emoji: "🌦️" },
  53: { description: "이슬비", emoji: "🌦️" },
  55: { description: "강한 이슬비", emoji: "🌦️" },
  61: { description: "약한 비", emoji: "🌧️" },
  63: { description: "비", emoji: "🌧️" },
  65: { description: "강한 비", emoji: "🌧️" },
  66: { description: "약한 얼어붙는 비", emoji: "🌧️" },
  67: { description: "강한 얼어붙는 비", emoji: "🌧️" },
  71: { description: "약한 눈", emoji: "🌨️" },
  73: { description: "눈", emoji: "🌨️" },
  75: { description: "강한 눈", emoji: "❄️" },
  77: { description: "싸락눈", emoji: "❄️" },
  80: { description: "약한 소나기", emoji: "🌦️" },
  81: { description: "소나기", emoji: "🌧️" },
  82: { description: "강한 소나기", emoji: "⛈️" },
  85: { description: "약한 눈 소나기", emoji: "🌨️" },
  86: { description: "강한 눈 소나기", emoji: "🌨️" },
  95: { description: "뇌우", emoji: "⛈️" },
  96: { description: "약한 우박 동반 뇌우", emoji: "⛈️" },
  99: { description: "강한 우박 동반 뇌우", emoji: "⛈️" },
};

export function describeWeatherCode(code: number): { description: string; emoji: string } {
  // 코드에 맞는 설명을 찾고, 없는 코드는 '알 수 없음'으로 처리합니다.
  return WEATHER_CODE_MAP[code] ?? { description: "알 수 없음", emoji: "❓" };
}

// 도시 검색으로 얻는 위치 정보의 데이터 모양입니다.
export interface GeocodeResult {
  // 도시 이름입니다.
  name: string;
  // 국가 이름입니다.
  country: string;
  // 시·도 같은 상위 행정 구역입니다. 없을 수도 있습니다.
  admin1?: string;
  // 지도상의 남북 위치 값입니다.
  latitude: number;
  // 지도상의 동서 위치 값입니다.
  longitude: number;
}

// 도시 이름을 받아 위치 정보로 바꾸는 비동기 함수입니다.
export async function geocodeCity(cityName: string): Promise<GeocodeResult | null> {
  // 한글 주요 도시면 영문 검색어를 쓰고, 그 외에는 입력한 이름을 그대로 씁니다.
  const searchName = KOREAN_CITY_QUERY_MAP[cityName] ?? cityName;
  // 외부 서비스에 보낼 검색 주소를 만듭니다.
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(searchName)}&count=1&language=ko&format=json`;
  // 외부 위치 검색 서비스에 요청하고, 답이 올 때까지 기다립니다.
  const res = await fetch(url);
  // 서비스가 성공 응답을 보내지 않으면 오류를 만들어 호출한 곳에 알립니다.
  if (!res.ok) {
    throw new Error(`지오코딩 API 오류: ${res.status}`);
  }
  // JSON 답변을 자바스크립트 데이터로 읽습니다.
  const data = (await res.json()) as { results?: any[] };

  // 검색 결과가 없으면 null을 돌려 줍니다.
  if (!data.results || data.results.length === 0) {
    return null;
  }

  // 여러 결과 중 가장 처음 나온 결과를 사용합니다.
  const r = data.results[0];
  // 외부 서비스의 복잡한 답에서 앱에 필요한 정보만 골라 반환합니다.
  return {
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  };
}

// 프론트엔드에 전달할 현재 날씨 정보의 데이터 모양입니다.
export interface CurrentWeather {
  // 실제 기온입니다.
  temperature: number;
  // 사람이 느끼는 기온입니다.
  apparentTemperature: number;
  // 공기 중 수분 비율입니다.
  humidity: number;
  // 바람의 속도입니다.
  windSpeed: number;
  // 현재 내린 비나 눈의 양입니다.
  precipitation: number;
  // 외부 서비스가 제공한 숫자 날씨 코드입니다.
  weatherCode: number;
  // 사람이 읽는 날씨 설명입니다.
  description: string;
  // 날씨 상태를 나타내는 아이콘입니다.
  emoji: string;
  // 날씨를 관측한 시각입니다.
  observedAt: string;
}

// 위도와 경도를 받아 그 장소의 현재 날씨를 가져오는 비동기 함수입니다.
export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  // 외부 서비스에 필요한 요청 조건을 안전하게 조립합니다.
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    timezone: "auto",
  });

  // 완성된 주소로 외부 날씨 서비스에 요청합니다.
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  // 외부 서비스가 실패 응답을 보내면 오류를 만들어 호출한 곳에 알립니다.
  if (!res.ok) {
    throw new Error(`날씨 API 오류: ${res.status}`);
  }
  // JSON 답변을 자바스크립트 데이터로 읽습니다.
  const data = (await res.json()) as { current: any };
  // 현재 날씨 부분만 따로 꺼냅니다.
  const c = data.current;
  // 숫자 날씨 코드를 한글 설명과 아이콘으로 바꿉니다.
  const { description, emoji } = describeWeatherCode(c.weather_code);

  // 외부 서비스의 필드명을 앱에서 쓰기 좋은 이름으로 정리해 반환합니다.
  return {
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    precipitation: c.precipitation,
    weatherCode: c.weather_code,
    description,
    emoji,
    observedAt: c.time,
  };
}

// 서버가 성공했을 때 보내는 전체 날씨 응답의 데이터 모양입니다.
export interface WeatherResponse {
  // 검색된 장소 정보입니다.
  location: {
    // 도시 이름입니다.
    name: string;
    // 시·도 같은 행정 구역이며, 없으면 null입니다.
    admin1: string | null;
    // 국가 이름입니다.
    country: string;
  };
  // 해당 장소의 현재 날씨 정보입니다.
  weather: {
    // 실제 기온입니다.
    temperature: number;
    // 사람이 느끼는 기온입니다.
    apparentTemperature: number;
    // 습도입니다.
    humidity: number;
    // 바람 속도입니다.
    windSpeed: number;
    // 비나 눈의 양입니다.
    precipitation: number;
    // 외부 서비스의 숫자 날씨 코드입니다.
    weatherCode: number;
    // 사람이 읽는 날씨 설명입니다.
    description: string;
    // 날씨를 표현하는 아이콘입니다.
    emoji: string;
    // 날씨를 관측한 시각입니다.
    observedAt: string;
  };
}

// 서버가 실패했을 때 보내는 오류 응답의 데이터 모양입니다.
export interface ApiError {
  // 사용자에게 보여 줄 오류 문구입니다.
  error: string;
}

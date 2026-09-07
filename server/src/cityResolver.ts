// LLM이 해석한 도시 검색 결과의 모양입니다.
interface CityResolution {
  searchQuery: string;
}

// 입력한 도시명을 Open-Meteo가 잘 찾을 수 있는 표준 검색어로 바꿉니다.
export async function resolveCityQuery(cityName: string): Promise<string> {
  // API 키가 없으면 비용이 드는 LLM 호출 없이 기존 도시명을 그대로 사용합니다.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return cityName;
  }

  // 사용할 모델은 환경 변수로 바꿀 수 있으며, 기본값은 비용이 낮은 모델입니다.
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You normalize weather-search city input for the Open-Meteo geocoding API. Return only JSON with one property, searchQuery. Expand ambiguous common city abbreviations to the most likely world city, including city, region/state, and country in English. Examples: LA becomes Los Angeles, California, United States; NYC becomes New York City, New York, United States. Do not invent locations.",
        },
        {
          role: "user",
          content: cityName,
        },
      ],
      temperature: 0,
    }),
  });

  // LLM 서비스 오류는 호출한 쪽에서 기존 검색어로 되돌릴 수 있게 오류로 알립니다.
  if (!response.ok) {
    throw new Error(`LLM 도시 해석 오류: ${response.status}`);
  }

  // LLM이 보낸 JSON 문자열을 읽습니다.
  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM이 도시 검색어를 반환하지 않았습니다.");
  }

  // JSON에서 공백을 제거한 검색어를 꺼냅니다.
  const resolution = JSON.parse(content) as CityResolution;
  const searchQuery = resolution.searchQuery?.trim();
  if (!searchQuery) {
    throw new Error("LLM이 올바른 도시 검색어를 반환하지 않았습니다.");
  }

  return searchQuery;
}
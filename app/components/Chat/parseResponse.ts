// LLMResponseParser.ts

export interface ParsedResponse {
  type: 'casual' | 'iot';
  code: string | null;
  content: string;
}

export const parseResponse = (response: string): ParsedResponse => {
  // #IOT# 태그가 포함되어 있는지 확인
  const iotIndex = response.indexOf('#IOT#');
  
  if (iotIndex !== -1) {
    // IOT 태그 이후의 코드를 찾음
    const codeMatch = response.match(/\[([^\]]+)\]/); // 대괄호 안의 내용을 매칭
    const content = response.replace(/#IOT#|\[[^\]]+\]/g, '').trim(); // #IOT#와 [코드]를 모두 제거하고 나머지 내용을 content로 설정

    if (codeMatch) {
      const code = codeMatch[1];
      return { type: 'iot', code, content };
    } else {
      return { type: 'iot', code: null, content };
    }
  } else {
    return { type: 'casual', code: null, content: response.replace('#CASUAL#', '').trim() };
  }
};

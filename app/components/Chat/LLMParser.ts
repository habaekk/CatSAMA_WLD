// LLMResponseParser.ts

export interface ParsedResponse {
    type: 'casual' | 'iot';
    code: string | null;
    content: string;
  }
  
  export const parseResponse = (response: string): ParsedResponse => {
  
    if (response.includes('#IOT#')) {
      const codeMatch = response.match(/\[([^\]]+)\]/); // 대괄호 안의 내용을 매칭
      const contentMatch = response.match(/\]\s*(.*)/); // ']' 이후의 내용을 매칭
      console.log('codematch:', codeMatch); // 콘솔에 response 값 출력
      console.log('contentmatch:', contentMatch); // 콘솔에 response 값 출력
  
      if (codeMatch && contentMatch) {
        const code = codeMatch[1];
        const content = contentMatch[1];
        return { type: 'iot', code, content };
      } else {
        return { type: 'iot', code: null, content: response.replace('#IOT#', '').trim() };
      }
    } else {
      return { type: 'casual', code: null, content: response };
    }
  };
  
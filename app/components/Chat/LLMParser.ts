// LLMResponseParser.ts

export interface ParsedResponse {
    type: 'casual' | 'iot';
    code: string | null;
    content: string;
  }
  
  export const parseResponse = (response: string): ParsedResponse => {
    if (response.includes('#IOT#')) {
      const codeMatch = response.match(/\[(.*?)]/);
      const contentMatch = response.match(/\] (.*)/);
  
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
  
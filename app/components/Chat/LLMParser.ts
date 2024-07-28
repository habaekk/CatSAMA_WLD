// LLMResponseParser.ts

export interface ParsedResponse {
    type: 'casual' | 'iot';
    code: string | null;
    content: string;
  }
  
  export const parseResponse = (response: string): ParsedResponse => {
    if (response.includes('#IOT#')) {
      const iotMatch = response.match(/\[(.*?)\]/);
      const contentMatch = response.match(/\] (.*)/);
  
      if (iotMatch && contentMatch) {
        const code = iotMatch[1];
        const content = contentMatch[1];
        return { type: 'iot', code, content };
      } else {
        return { type: 'iot', code: null, content: response.replace('#IOT#', '').trim() };
      }
    } else {
      return { type: 'casual', code: null, content: response };
    }
  };
  
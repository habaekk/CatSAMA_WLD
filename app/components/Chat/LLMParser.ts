// LLMResponseParser.ts

export interface ParsedResponse {
    type: 'casual' | 'iot' | 'unknown';
    content: string;
  }
  
  export const parseResponse = (response: string): ParsedResponse => {
    const casualKeywords = ['catSAMA', 'cute', 'chat'];
    const iotKeywords = ['THIS IS IOT SERVICE'];
  
    const isCasual = casualKeywords.some((keyword) =>
      response.includes(keyword)
    );
    const isIot = iotKeywords.some((keyword) => response.includes(keyword));
  
    if (isIot) {
      return { type: 'iot', content: response };
    } else if (isCasual) {
      return { type: 'casual', content: response };
    } else {
      return { type: 'unknown', content: response };
    }
  };
  
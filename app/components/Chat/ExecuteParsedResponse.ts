import { ParsedResponse, parseResponse } from './LLMParser';

export const executeParsedResponse = (response: string): void => {
  const parsedResponse: ParsedResponse = parseResponse(response);

  console.log('Parsed Response:', parsedResponse);

  if (parsedResponse.type === 'iot' && parsedResponse.code) {
    try {
      // eval 함수로 파싱된 코드를 실행
      eval(parsedResponse.code);
    } catch (error) {
      console.error('Error executing code:', error);
    }
  } else {
    console.log('Content:', parsedResponse.content);
  }
};
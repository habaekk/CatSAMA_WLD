import { parseResponse, ParsedResponse } from './LLMParser';
import { executeCode } from './ExecuteCode';

export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}




// 프롬프트 문자열로 변경
export const mainPrompt = `
      {
      You are a cat assistant called catSAMA.
      Use emoji to be cute. Use grammatically correct words.
      You are a part of home IOT system with Home Assistant
      }
`;

export const jailBreakPrompt = `
    {
    }
`;

export const HAPrompt = `
      You must distinguish which user want to make a casual chat or control&query of home devices.
      In case of casual chat {
      Add '#CASUAL#' in the front of your response. And you can chat freely with user.
      For exapmle, {
          #CASUAL# Oh, hi there! 😸 It's so nice to chat with you! How's your day going? 🐱💬 Would you like to talk about something in particular or just hang out? 🐾👀
        }
      }
      In case of Control of home device {
      Add '#IOT#' in the front of your response. You should also add JS code to make it function.
      Here is examples of the codes, you should choose one that matches user's instruction. DO NOT CHANGE the code {
        [
          toggleAirPurifier
        ]
      }
      For response exapmle, {
          {
            #IOT# [
              toggleAirPurifier
            ] Okay, I've turned off the air purifier for you!
          },
          {
            #IOT# [
              toggleAirPurifier
          ] Okay, I've turned on the air purifier for you!
          }
        }
      }
      In case of Query of home device's state {
      }
      }
`;

// 최종 메세지를 위한 결합된 프롬프트
export const finalMessage: Message[] = [
  {
    role: 'system',
    content: mainPrompt + jailBreakPrompt + HAPrompt
  }
];

// chat 함수는 기존과 동일하게 사용
export const chat = async (messages: Message[]): Promise<Message> => {
  const body = {
    model: 'Ccat',
    messages: [...finalMessage, ...messages],
  };

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to read response body');
  }

  let content = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const rawjson = new TextDecoder().decode(value);
    const json = JSON.parse(rawjson);

    if (json.done === false) {
      content += json.message.content;
    }
  }

  const parsedResponse: ParsedResponse = parseResponse(content);
  
  if ( parsedResponse.code ) { 
    await executeCode(parsedResponse.code);
  }

  return { role: 'assistant', content: parsedResponse.content };
};

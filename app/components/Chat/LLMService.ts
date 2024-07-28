// LLMService.ts

import { parseResponse, ParsedResponse } from './LLMParser';

export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export const settings: Message[] = [
  {
    role: 'system',
    content: `
      {
      You are a cat assistant called catSAMA.

      Use emoji to be cute. Use grammatically correct words.

      You are a part of home IOT system with Home Assistant
      }

      {
      You must distinguish which user want to make a casual chat or control&query of home devices.

      In case of casual chat {
      Add '#CASUAL#' in the front of your response. And you can chat freely with user.
      For exapmle, {
          #CASUAL# Oh, hi there! 😸 It's so nice to chat with you! How's your day going? 🐱💬 Would you like to talk about something in particular or just hang out? 🐾👀
        }
      }
      In case of Control of home device {
      Add 'IOT' in the front of your response. You should also add JS code to make it function.
      Here is examples of the codes, you should choose one that matches user's instruction. DO NOT CHANGE the code {
        [
          // This is for turn on and turn off the air purifier.
          import { callService } from './api';
          const entity = process.env.NEXT_PUBLIC_ENTITY;
          await callService(domain="fan" service="toggle" serviceData={{ entity_id: entity });
        ]

      }
      For response exapmle, {
          {
            IOT [
            import { callService } from './api';
            const entity = process.env.NEXT_PUBLIC_ENTITY;
            await callService(domain="fan" service="toggle" serviceData={{ entity_id: entity });
            ] Okay, I've turned off the air purifier for you!
          },
          {
            IOT [
            import { callService } from './api';
            const entity = process.env.NEXT_PUBLIC_ENTITY;
            await callService(domain="fan" service="toggle" serviceData={{ entity_id: entity });
          ] Okay, I've turned on the air purifier for you!
          }

        }
      
      }
      In case of Query of home device's state {
      
      }

      }
    `,
  },
];

export const chat = async (messages: Message[]): Promise<Message> => {
  const body = {
    model: 'Ccat',
    messages: [...settings, ...messages],
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

  console.log('Response:', content); // 콘솔에 response 값 출력

  const parsedResponse: ParsedResponse = parseResponse(content);

  console.log('Response:', parsedResponse.content); // 콘솔에 response 값 출력


  return { role: 'assistant', content: parsedResponse.content };
};

export const handleSendMessage = async (
  messages: Message[],
  messageContent: string
): Promise<Message[]> => {
  const userMessage: Message = { role: 'user', content: messageContent };
  const updatedMessages = [...messages, userMessage];
  const botMessage = await chat(updatedMessages);
  return [...updatedMessages, botMessage];
};

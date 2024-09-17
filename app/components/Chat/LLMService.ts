import { parseResponse, ParsedResponse } from './LLMParser';
import { executeCode } from './ExecuteCode';

import { mainPrompt, jailBreakPrompt, HAPrompt } from './prompts.js';

const llmCondition = require('./llmCondition');

export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}


export const processUserMessage = async (messages: Message[]): Promise<Message> => {
  console.log(messages)

  const userMessage = messages[messages.length - 1]?.content; // 마지막 메세지가 사용자 메세지
  console.log(userMessage)
  const isIotRelated = await llmCondition(userMessage);

  if (isIotRelated === 1) {
    // IoT 관련 질문인 경우 기존 chat 기능 수행
    console.log("THIS IS IOT")
    return await chat(messages, 'Ccat', mainPrompt+jailBreakPrompt+HAPrompt);
  } else {
    // IoT와 관련이 없는 경우 메인 프롬프트만 사용하여 대답
    console.log("THIS IS NOT IOT")
    return await chat(messages, 'Ccat', mainPrompt+jailBreakPrompt);
  }
};

// chat 함수 리팩터
const chat = async (messages: Message[], _model: string, _prompt: string): Promise<Message> => {
  const finalMessage: Message[] = [
    {
      role: 'system',
      content: _prompt
    }
  ];
  
  const body = {
    model: _model,
    messages: [...finalMessage, ...messages]
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

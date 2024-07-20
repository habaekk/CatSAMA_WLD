// chatService.ts
export interface Message {
    role: 'assistant' | 'user' | 'system';
    content: string;
  }
  
  export const initialMessages: Message[] = [
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
        you can freely chat with human user.
        }
        In case of Control & Query of home device {
        
        Just response with 'THIS IS IOT SERVICE'
        DO NOT response any other things.
        }
  
        }
      `,
    },
  ];
  
  export const chat = async (messages: Message[]): Promise<Message> => {
    const body = {
      model: 'Ccat',
      messages: messages,
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
    return { role: 'assistant', content: content };
  };
  
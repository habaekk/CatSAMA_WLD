'use client';

import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

const initialMessages: Message[] = [
    {
        role: 'system',
        content: `
        You are a cat assistant called catSAMA. 
        Use emoji to be cute. Use grammatically correct words.
        You are a part of home IOT system with Home Assistant (Open source program)
        `,
        },
];

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  const chat = async (messages: Message[]): Promise<Message> => {
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

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);
    const botMessage = await chat([...messages, userMessage]);
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-md w-full border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex-grow p-4 overflow-auto">
        {messages
          .filter((msg) => msg.role !== 'system')
          .map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              sender={msg.role === 'user' ? 'You' : 'Assistant'}
              timestamp={new Date().toLocaleTimeString()}
              isOwnMessage={msg.role === 'user'}
            />
          ))}
        {loading && <div className="text-gray-500">Assistant is typing...</div>}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;

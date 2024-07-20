'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  You are a part of home IOT system with Home Assistant

  You must distinguish which user want to make a casual chat or control&query of home devices.

  In case of casual chat {
  you can freely chat with human user.
  }
  In case of Control & Query of home device {
  Just response with 'THIS IS IOT SERVICE'
  DO NOT response any other things.
  }
    `,
  },
];

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[80vh] max-w w-full border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700">
      <div className="flex-grow p-4 overflow-auto dark:bg-gray-800" ref={chatWindowRef}>
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
        {loading && <div className="text-gray-500 dark:text-gray-400">Assistant is typing...</div>}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;

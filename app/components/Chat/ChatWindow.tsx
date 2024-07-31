// ChatWindow.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { settings, Message, chat } from './LLMService';

interface TimestampedMessage extends Message {
  timestamp: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<TimestampedMessage[]>(settings.map(msg => ({ ...msg, timestamp: new Date().toLocaleTimeString() })));
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: TimestampedMessage = { role: 'user', content: messageContent, timestamp: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);

    const botMessage = await chat([...messages, userMessage]);
    setMessages((prevMessages) => [...prevMessages, { ...botMessage, timestamp: new Date().toLocaleTimeString() }]);
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
              timestamp={msg.timestamp}
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

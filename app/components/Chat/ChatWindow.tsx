// ChatWindow.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Message, processUserMessage } from './LLMService';

interface TimestampedMessage extends Message {
  timestamp: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<TimestampedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (messageContent: string) => {
    // 유저 메시지를 생성
    const userMessage: TimestampedMessage = { 
      role: 'user', 
      content: messageContent, 
      timestamp: new Date().toLocaleTimeString() 
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);

    const updatedMessages = [...messages, userMessage];

    const botMessage = await processUserMessage(updatedMessages);

    setMessages((prevMessages) => [...prevMessages, { ...botMessage, timestamp: new Date().toLocaleTimeString() }]);
    setLoading(false);
};


  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[80vh] max-w w-full border border-gray-300 rounded-lg overflow-hidden bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex-grow p-4 overflow-auto" ref={chatWindowRef}>
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

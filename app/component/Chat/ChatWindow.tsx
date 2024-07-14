'use client';

import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
  isOwnMessage: boolean;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'You',
      timestamp: new Date().toLocaleTimeString(),
      isOwnMessage: true,
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-md w-full border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
      <div className="flex-grow p-4 overflow-auto">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.text}
            sender={msg.sender}
            timestamp={msg.timestamp}
            isOwnMessage={msg.isOwnMessage}
          />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;

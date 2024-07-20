import React from 'react';

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp, isOwnMessage }) => {
  return (
    <div className={`flex flex-col mb-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center ${isOwnMessage ? 'bg-blue-500 text-white dark:bg-blue-700' : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'} rounded-lg p-2 max-w-xs`}>
        <span>{message}</span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</span>
    </div>
  );
};

export default ChatMessage;

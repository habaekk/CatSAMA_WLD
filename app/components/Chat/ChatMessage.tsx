import React from 'react';

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, timestamp, isOwnMessage }) => {
  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
          isOwnMessage
            ? 'bg-[var(--brand)] text-[#081018]'
            : 'border border-white/10 bg-white/6 text-white'
        }`}
      >
        <span className="whitespace-pre-wrap break-words">{message}</span>
      </div>
      <span className="mt-2 text-xs text-[var(--text-muted)]">{timestamp}</span>
    </div>
  );
};

export default ChatMessage;

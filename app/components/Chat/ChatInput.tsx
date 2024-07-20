// ChatInput.tsx
import React, { useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if (inputRef.current) {
      const message = inputRef.current.value;
      if (message.trim() !== '') {
        onSendMessage(message);
        inputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-300 p-4 dark:border-gray-700 dark:bg-gray-800">
      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white"
        placeholder="Type your message..."
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatInput;

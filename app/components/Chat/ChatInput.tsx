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
    <div className="flex items-center border-t border-gray-300 p-4 dark:border-gray-700 dark:bg-gray-800">
      <input
        ref={inputRef}
        type="text"
        className="flex-grow p-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white"
        placeholder="Type your message..."
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={handleSend}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg dark:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;

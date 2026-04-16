import React, { useEffect, useRef } from 'react';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-white/10 bg-black/10 p-4">
      <input
        ref={inputRef}
        type="text"
        className="flex-grow border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[var(--text-muted)]"
        placeholder="Send a message to CatSAMA"
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleSend}
        className="bg-[var(--brand)] px-5 py-3 font-semibold text-[#081018] transition hover:brightness-110"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;

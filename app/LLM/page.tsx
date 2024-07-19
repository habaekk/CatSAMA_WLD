import React from 'react';
import ChatWindow from '../component/Chat/ChatWindow';

export default function LLM() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-6 relative">
      <div className="flex justify-center items-center flex-grow w-full">
        <ChatWindow />
      </div>
    </div>
  );
};

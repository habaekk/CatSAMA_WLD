import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import ChatWindow from '../component/Chat/ChatWindow';

export default function LLM() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-6 relative">
      <Header />
      <div className="flex justify-center items-center flex-grow w-full">
        <ChatWindow />
      </div>
      <Footer />
    </div>
  );
};

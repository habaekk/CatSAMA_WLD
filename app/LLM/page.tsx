// pages/settings/page.tsx

import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';

export default function LLM() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
        <Header />
        <div>
            <h2>Welcome to the LLM Page</h2>
            <p>Here you can chat with Cat LLM.</p>
        </div>
        <Footer />
        
    </div>
  );
};
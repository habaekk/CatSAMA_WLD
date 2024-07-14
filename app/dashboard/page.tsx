// pages/settings/page.tsx

import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';

export default function DashBoard() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
        <Header />
        <div>
            <h2>Welcome to the DashBoard Page</h2>
            <p>Here you can customize your settings.</p>
        </div>
        <Footer />
        
    </div>
  );
};
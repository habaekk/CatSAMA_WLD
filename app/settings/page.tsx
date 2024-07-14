// pages/settings/page.tsx

import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';

const SettingsPage: React.FC = () => {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
        <Header />
        <div>
            <h2>Welcome to the Settings Page</h2>
            <p>Here you can customize your settings.</p>
        </div>
        <Footer />
        
    </div>
  );
};

export default SettingsPage;

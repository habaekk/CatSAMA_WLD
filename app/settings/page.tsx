'use client';

import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import DarkModeToggle from '../component/DarkModeToggle';

export default function Settings() {

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative text-black dark:text-white">
      <Header />
      <div>
        <h2 className="text-2xl font-bold">Welcome to the Settings Page</h2>
        <p>Here you can customize your settings.</p>
        <DarkModeToggle />
      </div>
      <Footer />
    </div>
  );
}

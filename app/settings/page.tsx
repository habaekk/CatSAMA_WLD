'use client';

import React, { useState, useEffect } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  };

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative bg-white dark:bg-gray-800 text-black dark:text-white">
      <Header />
      <div>
        <h2 className="text-2xl font-bold">Welcome to the Settings Page</h2>
        <p>Here you can customize your settings.</p>
        <button
          onClick={toggleDarkMode}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded dark:bg-yellow-500"
        >
          Toggle Dark Mode
        </button>
      </div>
      <Footer />
    </div>
  );
}

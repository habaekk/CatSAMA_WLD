'use client';

import React from 'react';
import { useRecoilState } from 'recoil';
import { darkModeState } from '../state/theme';
import Header from '../component/Header';
import Footer from '../component/Footer';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative text-black dark:text-white">
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

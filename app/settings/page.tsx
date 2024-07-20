'use client';

import React from 'react';
import DarkModeToggle from '../components/DarkMode/DarkModeToggle';

export default function Settings() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-start p-24 relative text-black dark:text-white">
      <div className="w-full mt-20">
        <h2 className="text-5xl font-bold mb-4">Settings</h2>
        <DarkModeToggle />
      </div>
    </div>
  );
}

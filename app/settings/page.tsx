'use client';

import React, { useState } from 'react';
import DarkModeToggle from '../components/DarkMode/DarkModeToggle';

export default function Settings() {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const entity = process.env.NEXT_PUBLIC_ENTITY;

  const toggleAdvancedSettings = () => {
    setShowAdvancedSettings(!showAdvancedSettings);
  };

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-start p-6 relative text-black dark:text-white">
      <div className="w-full max-w-md mt-40">
        <h2 className="text-5xl font-bold mb-4 text-center text-black dark:text-white">Settings</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-black dark:text-white">Dark Mode</label>
            <DarkModeToggle />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-black dark:text-white">LLM Model</label>
            <select className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white">
              <option value="model1">Model 1</option>
              <option value="model2">Model 2</option>
              <option value="model3">Model 3</option>
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-black dark:text-white">My Cat NFT</label>
            <select className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white">
              <option value="nft1">NFT 1</option>
              <option value="nft2">NFT 2</option>
              <option value="nft3">NFT 3</option>
            </select>
          </div>
          
          <div>
            <button
              className="flex items-center justify-between w-full p-2 border rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              onClick={toggleAdvancedSettings}
            >
              <span className="text-lg font-semibold">Advanced Settings</span>
              <span>{showAdvancedSettings ? '▲' : '▼'}</span>
            </button>
            {showAdvancedSettings && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-lg font-semibold text-black dark:text-white">Home Assistant URL</label>
                  <input type="text" className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white" placeholder="Enter Home Assistant URL" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-lg font-semibold text-black dark:text-white">Ollama API URL</label>
                  <input type="text" className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white" placeholder="Enter Ollama API URL" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-lg font-semibold text-black dark:text-white">LLM Settings Message</label>
                  <textarea className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white" rows="4" placeholder="Enter LLM settings message"></textarea>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

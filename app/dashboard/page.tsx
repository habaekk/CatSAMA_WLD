import React from 'react';

export default function DashBoard() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-between p-6 relative dark:text-white dark:text-white">
      <div className="flex flex-col items-center justify-center w-full flex-grow h-full">
        <iframe
          src="http://127.0.0.1:8123"
          title="Home Assistant"
          className="w-full h-[80vh] rounded-lg"
        ></iframe>
      </div>
    </div>
  );
}

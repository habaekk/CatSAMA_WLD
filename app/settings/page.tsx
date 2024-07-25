'use client';

import React from 'react';
import DarkModeToggle from '../components/DarkMode/DarkModeToggle';
import FetchStateButton from '../components/FetchStateButton';
import SetStateButton from '../components/SetStateButton';
import GetServiceButton from '../components/GetServiceButton';
import CallServiceButton from '../components/CallServiceButton';



export default function Settings() {
  const entity = process.env.NEXT_PUBLIC_ENTITY;

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-start p-24 relative text-black dark:text-white">
      <div className="w-full mt-20">
        <h2 className="text-5xl font-bold mb-4">Settings</h2>
        <div className="flex flex-col space-y-4">
          <DarkModeToggle />
          <FetchStateButton entityId={entity} />
          <SetStateButton entityId={entity} newState="off" />
          <GetServiceButton />
          <CallServiceButton domain="fan" service="toggle" serviceData={{ entity_id: entity }} />
        </div>
      </div>
    </div>
  );
}

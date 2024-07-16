// pages/settings/layout.tsx

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: LayoutProps) {
  return (
    <div className='dark:bg-gray-800'>
      {children}
    </div>
  );
};

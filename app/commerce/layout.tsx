// pages/settings/layout.tsx

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function CommerceLayout({ children }: LayoutProps) {
  return (
    <div>
      {children}
    </div>
  );
};

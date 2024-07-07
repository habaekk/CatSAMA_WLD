// pages/user/layout.tsx

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-8">
        {children}
      </main>
    </div>
  );
}

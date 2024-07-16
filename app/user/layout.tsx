// pages/user/layout.tsx

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-800">
      <main>
        {children}
      </main>
    </div>
  );
}

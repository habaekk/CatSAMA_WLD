// pages/user/layout.tsx

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main>
        {children}
      </main>
    </div>
  );
}

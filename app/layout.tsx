import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from './component/ThemeProvider';
import RecoilRootProvider from './component/RecoilRootProvider';
import DarkMode from './component/DarkMode';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CatSAMA',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr">
      <body className='${inter.className} dark:bg-gray-800'>
        <RecoilRootProvider>
            {children}
            <DarkMode />
        </RecoilRootProvider>
        
      </body>
    </html>
  );
}

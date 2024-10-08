import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import RecoilRootProvider from './components/RecoilRootProvider';
import DarkMode from './components/DarkMode/DarkMode';
import Header from './components/Footer-Header/Header';
import Footer from './components/Footer-Header/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CatSAMA',
  description: 'Web page of CatSAMA, cute assistant.',
  icons: {
    icon: '/logo.webp', // 파비콘 경로 설정

  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const darkMode = localStorage.getItem('darkMode') === 'true';
                if (darkMode) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} dark:bg-gray-800`}>
        <RecoilRootProvider>
          <header>
            <Header />            
          </header>
          <main className="main-content">
            {children}
          </main>
          <footer>
            <Footer />
          </footer>
          <DarkMode />
        </RecoilRootProvider>
      </body>
    </html>
  );
}

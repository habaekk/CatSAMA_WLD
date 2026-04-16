import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import RecoilRootProvider from './components/RecoilRootProvider';
import DarkMode from './components/DarkMode/DarkMode';
import AppShell from './components/AppShell';

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CatSAMA',
  description: 'Web page of CatSAMA, cute assistant.',
  icons: {
    icon: '/logo.webp',
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
      <body className={notoSansKr.className}>
        <RecoilRootProvider>
          <AppShell>{children}</AppShell>
          <DarkMode />
        </RecoilRootProvider>
      </body>
    </html>
  );
}

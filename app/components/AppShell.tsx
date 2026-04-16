'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const topNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/settings', label: 'Settings' },
];

const sideNavLinks = [
  { href: '/', label: 'Home', icon: 'H' },
  { href: '/dashboard', label: 'Dashboard', icon: 'D' },
  { href: '/vtuber', label: 'VTuber', icon: 'V' },
  { href: '/LLM', label: 'Cat LLM', icon: 'L' },
  { href: '/settings', label: 'Settings', icon: 'S' },
];

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[52px] bg-[rgba(10,13,20,0.94)] lg:block">
        <div className="flex h-full flex-col items-center px-3 pb-4 pt-20">
          <div className="flex flex-col items-center gap-3">
            {sideNavLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  className={`flex h-11 w-11 items-center justify-center border text-sm font-semibold transition ${
                    active
                      ? 'border-[#19e2cf]/40 bg-[#19e2cf] text-[#081018]'
                      : 'border-white/8 bg-white/4 text-[var(--text-dim)] hover:border-white/14 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {link.icon}
                </Link>
              );
            })}
          </div>

        </div>
      </aside>

      <header className="sticky top-0 z-50 bg-[rgba(10,13,20,0.82)] backdrop-blur-xl lg:pl-[52px]">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[var(--panel-strong)]">
              <Image src="/logo.webp" alt="CatSAMA" width={26} height={26} priority />
            </div>
            <div className="hidden sm:block">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                smarthome AI
              </p>
              <p className="text-sm font-semibold text-white">CatSAMA</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {topNavLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm transition ${
                    active
                      ? 'bg-[var(--brand)] text-[#081018]'
                      : 'text-[var(--text-dim)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link href="/user" className="ml-auto flex h-10 w-10 items-center justify-center bg-white/6">
            <Image src="/user.svg" alt="User" width={22} height={22} />
          </Link>
        </div>
      </header>

      <div className="lg:pl-[52px]">
        <div className="mx-auto max-w-[1600px]">
          <main className="min-h-[calc(100vh-64px)] overflow-hidden bg-[var(--panel)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

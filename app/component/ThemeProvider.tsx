'use client';

import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { darkModeState } from '../state/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);

  // 컴포넌트가 처음 마운트될 때 로컬 스토리지에서 저장된 값을 가져옴
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
  }, [setIsDarkMode]);

  // isDarkMode 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}

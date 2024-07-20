'use client';

import { useRecoilState } from 'recoil';
import { darkModeState } from '../../state/theme';
import { useLayoutEffect } from 'react';

const DarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);

  useLayoutEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [setIsDarkMode]);

  return (
    <div></div>
  )
};

export default DarkMode;

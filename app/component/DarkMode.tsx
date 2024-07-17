'use client';

import { useRecoilState } from 'recoil';
import { darkModeState } from '../state/theme';
import { useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, [setIsDarkMode]);

  return (
    <div></div>
  )
};

export default DarkModeToggle;

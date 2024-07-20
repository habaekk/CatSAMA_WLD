import { useRecoilState } from 'recoil';
import { darkModeState } from '../../state/theme';
import { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
    setIsMounted(true);
  }, [setIsDarkMode]);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    localStorage.setItem('darkMode', newDarkModeState);
    document.documentElement.classList.toggle('dark', newDarkModeState);
  };

  if (!isMounted) {
    return <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded" disabled>Loading...</button>;
  }

  return (
    <button onClick={toggleDarkMode}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded dark:bg-yellow-500"
    >
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;

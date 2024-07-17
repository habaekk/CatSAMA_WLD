import { useRecoilState } from 'recoil';
import { darkModeState } from '../state/theme';
import { useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    localStorage.setItem('darkMode', newDarkModeState);
    document.documentElement.classList.toggle('dark', newDarkModeState);
  };

  return (
    <button onClick={toggleDarkMode}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded dark:bg-yellow-500"
    >
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}

    </button>
  );
};

export default DarkModeToggle;

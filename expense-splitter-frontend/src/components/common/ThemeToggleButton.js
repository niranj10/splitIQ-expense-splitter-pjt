// src/components/common/ThemeToggleButton.js

import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-primary dark:text-dark-primary bg-gray-200 dark:bg-dark-accent"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggleButton;

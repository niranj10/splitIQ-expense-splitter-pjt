// src/components/layout/Header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import ThemeToggleButton from '../common/ThemeToggleButton';

const Logo = () => (
  <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="text-primary dark:text-dark-primary transition-colors">
        <path d="M14.24 25.48L19.52 20L14.24 14.52L16 12.8L22.88 20L16 27.2L14.24 25.48Z" fill="currentColor"/>
        <path d="M31.76 25.48L26.48 20L31.76 14.52L30 12.8L23.12 20L30 27.2L31.76 25.48Z" fill="currentColor"/>
        <text x="40" y="27" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="currentColor">SplitIQ</text>
    </g>
  </svg>
);


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-primary shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center">
          {user && <span className="mr-4 text-sm font-medium text-gray-600 dark:text-gray-300">Welcome, {user.name}</span>}
          <ThemeToggleButton />
          {user && (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

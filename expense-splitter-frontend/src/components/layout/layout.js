// src/components/layout/Layout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Header />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;

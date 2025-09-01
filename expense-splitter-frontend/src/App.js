// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupDetailPage from './pages/GroupDetailPage';
import Layout from './components/layout/layout'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes with the main header */}
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="group/:groupId" element={<GroupDetailPage />} />
          </Route>

          {/* Routes without the main header */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

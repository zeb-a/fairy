import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClassProvider } from './contexts/ClassContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClassDashboard from './components/ClassDashboard';
import AwardSystem from './components/AwardSystem';
import GameCenter from './components/GameCenter';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <ClassProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<ClassDashboard />} />
              <Route path="/award" element={<AwardSystem />} />
              <Route path="/games" element={<GameCenter />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ClassProvider>
  );
}

export default App;

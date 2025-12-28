import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClassProvider } from './contexts/ClassContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ActivityProvider } from './components/LiveSnapshot';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClassDashboard from './components/ClassDashboard';
import Classes from './components/Classes';
import AwardSystem from './components/AwardSystem';
import GameCenter from './components/GameCenter';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import './App.css';

// Component to handle routing based on auth status
const AppRouter = () => {
  const { user, loading } = useUser();

  if (loading) {
    // Show the landing page while checking auth status to avoid showing only loading spinner
    return (
      <>
        <LandingPage />
      </>
    );
  }

  return (
    <>
      {user ? (
        // If user is authenticated, show the dashboard
        <>
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/dashboard/classes" element={<ClassDashboard />} />
              <Route path="/dashboard/games" element={<GameCenter />} />
              <Route path="/dashboard/reports" element={<Analytics />} />
              <Route path="/award" element={<AwardSystem />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </>
      ) : (
        // If user is not authenticated, show the landing page
        <LandingPage />
      )}
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <ClassProvider>
        <ActivityProvider>
          <Router>
            <div className="app">
              <AppRouter />
            </div>
          </Router>
        </ActivityProvider>
      </ClassProvider>
    </UserProvider>
  );
}

export default App;

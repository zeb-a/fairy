import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Classroom Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Welcome to Lil Fairy Award!</h3>
          <p>Your classroom gamification platform</p>
        </div>
        <div className="dashboard-card">
          <h3>Quick Stats</h3>
          <p>Total Students: 0</p>
          <p>Active Classes: 0</p>
          <p>Awards Given: 0</p>
        </div>
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
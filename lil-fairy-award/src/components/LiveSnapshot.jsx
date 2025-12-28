import React, { useState, useEffect, useContext } from 'react';
import { useClassContext } from '../contexts/ClassContext';

// Create a context for activities to share across the app
const ActivityContext = React.createContext();

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const { students } = useClassContext();

  // Initialize with some activities
  useEffect(() => {
    const initialActivities = [
      { id: 1, studentName: 'Emma Johnson', action: 'earned \'Participation\' award!', time: '2 min ago', type: 'strength' },
      { id: 2, studentName: 'Michael Chen', action: 'earned \'Needs Focus\' award!', time: '5 min ago', type: 'need' },
      { id: 3, studentName: 'Sophia Williams', action: 'earned \'Kindness\' award!', time: '10 min ago', type: 'strength' },
      { id: 4, studentName: 'James Wilson', action: 'earned \'Focus\' award!', time: '15 min ago', type: 'strength' },
    ];
    setActivities(initialActivities);
  }, []);

  // Add a new activity to the list
  const addActivity = (studentName, action, type) => {
    const newActivity = {
      id: Date.now(),
      studentName,
      action: `earned '${action}' award!`,
      time: 'Just now',
      type
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 14)]); // Keep only the last 15 activities
  };

  // Update time ago for each activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => 
        prev.map(activity => {
          const timeDiff = Date.now() - activity.id; // Using id as timestamp for demo
          let timeAgo;
          
          if (timeDiff < 60000) {
            timeAgo = 'Just now';
          } else if (timeDiff < 3600000) {
            timeAgo = `${Math.floor(timeDiff / 60000)} min ago`;
          } else if (timeDiff < 86400000) {
            timeAgo = `${Math.floor(timeDiff / 3600000)} hr ago`;
          } else {
            timeAgo = `${Math.floor(timeDiff / 86400000)} day ago`;
          }
          
          return { ...activity, time: timeAgo };
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const value = {
    activities,
    addActivity
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
};

const LiveSnapshot = ({ maxItems = 10 }) => {
  const { activities } = useActivityContext();

  return (
    <div className="live-snapshot glass">
      <h3>Live Snapshot</h3>
      <div className="activity-list">
        {activities.slice(0, maxItems).map(activity => (
          <div key={activity.id} className={`activity-item ${activity.type}`}>
            <div className="activity-content">
              <span className="activity-student">{activity.studentName}</span>
              <span className="activity-action">{activity.action}</span>
            </div>
            <span className="activity-time">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveSnapshot;
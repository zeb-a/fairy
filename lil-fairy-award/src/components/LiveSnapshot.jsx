import React, { useState, useEffect, useContext } from 'react';
import { useClassContext } from '../contexts/ClassContext';
import supabaseService from '../services/supabaseService';

// Create a context for activities to share across the app
const ActivityContext = React.createContext();

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const { students, selectedClass } = useClassContext();
  const [channel, setChannel] = useState(null);

  // Initialize with some activities and set up real-time listener
  useEffect(() => {
    if (selectedClass?.id) {
      // Subscribe to real-time updates for points_log
      const newChannel = supabaseService.realtime.subscribeToPoints((newPoint) => {
        // Get student name to create activity
        const student = students.find(s => s.id === newPoint.student_id);
        
        // Map point_type to user-friendly type
        const pointType = newPoint.point_type === 'strength' ? 'strength' : 'need';
        
        // Determine the reward type from the associated task
        const rewardType = newPoint.tasks?.title || newPoint.reward_type || 'Award';
        
        const newActivity = {
          id: newPoint.id || Date.now(),
          studentName: student?.name || 'Unknown Student',
          action: `earned '${rewardType}' award!`,
          time: 'Just now',
          type: pointType,
          created_at: newPoint.created_at || new Date().toISOString()
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 14)]); // Keep only the last 15 activities
      });
      
      setChannel(newChannel);
    }

    // Cleanup function
    return () => {
      if (channel) {
        supabaseService.realtime.unsubscribe(channel);
      }
    };
  }, [selectedClass?.id, students]);

  // Update time ago for each activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => 
        prev.map(activity => {
          const timeDiff = Date.now() - new Date(activity.created_at || activity.id).getTime();
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

  // Add a new activity to the list (for local use)
  const addActivity = (studentName, action, type) => {
    const newActivity = {
      id: Date.now(),
      studentName,
      action: `earned '${action}' award!`,
      time: 'Just now',
      type,
      created_at: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 14)]); // Keep only the last 15 activities
  };

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
import React, { useState, useEffect } from 'react';
import { useClassContext } from '../contexts/ClassContext';

const AwardSystem = () => {
  const { students, updateStudentPoints, loading } = useClassContext();
  const [activities, setActivities] = useState([]);

  // Initialize with some activities
  useEffect(() => {
    setActivities([
      { id: 1, studentName: 'Emma Johnson', action: 'received Strength award', time: '2 min ago', type: 'strength' },
      { id: 2, studentName: 'Michael Chen', action: 'received Need reminder', time: '5 min ago', type: 'need' },
      { id: 3, studentName: 'Sophia Williams', action: 'received Strength award', time: '10 min ago', type: 'strength' },
      { id: 4, studentName: 'James Wilson', action: 'received Strength award', time: '15 min ago', type: 'strength' },
    ]);
  }, []);

  // Add a new activity to the list
  const addActivity = (studentName, type) => {
    const newActivity = {
      id: Date.now(),
      studentName,
      action: `received ${type === 'strength' ? 'Strength' : 'Need'} award`,
      time: 'Just now',
      type
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only the last 10 activities
  };

  const handleAddAward = (student, type) => {
    updateStudentPoints(student.id, type, 1);
    addActivity(student.name, type);
  };

  if (loading) {
    return <div className="award-system">Loading...</div>;
  }

  return (
    <div className="award-system">
      <h1>Award System</h1>
      
      <div className="award-controls">
        <div className="award-type-selector">
          <h2>Award Type</h2>
          <div className="award-type-buttons">
            <button className="award-type-btn strength">
              <span className="award-icon">⭐</span>
              <span>Strength</span>
            </button>
            <button className="award-type-btn need">
              <span className="award-icon">🔴</span>
              <span>Need</span>
            </button>
          </div>
        </div>
        
        <div className="live-activity">
          <h2>Live Activity Feed</h2>
          <div className="activity-list">
            {activities.map(activity => (
              <div key={activity.id} className={`activity-item ${activity.type}`}>
                <span className="activity-student">{activity.studentName}</span>
                <span className="activity-action">{activity.action}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="student-award-section">
        <h2>Award to Students</h2>
        <div className="student-list">
          {students.map(student => (
            <div key={student.id} className="student-award-card">
              <div className="student-info">
                <span className="student-avatar">{student.avatar_url}</span>
                <span className="student-name">{student.name}</span>
              </div>
              <div className="award-buttons">
                <button 
                  className="award-strength-btn"
                  onClick={() => handleAddAward(student, 'strength')}
                >
                  ⭐ Strength
                </button>
                <button 
                  className="award-need-btn"
                  onClick={() => handleAddAward(student, 'need')}
                >
                  🔴 Need
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwardSystem;
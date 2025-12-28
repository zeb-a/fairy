import React, { useState, useEffect } from 'react';
import { useClassContext } from '../contexts/ClassContext';

const AwardSystem = () => {
  const { students, updateStudentPoints, loading } = useClassContext();
  const [activities, setActivities] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAwardPanel, setShowAwardPanel] = useState(false);

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

  const handleAddAward = (student, type, awardName) => {
    updateStudentPoints(student.id, type, 1);
    addActivity(`${student.name} earned '${awardName}'!`, type);
    setShowAwardPanel(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return <div className="award-system">Loading...</div>;
  }

  return (
    <div className="award-system">
      <h1>Interactive Classroom Dashboard</h1>
      
      <div className="student-grid">
        {students.map(student => (
          <div 
            key={student.id} 
            className="student-card glass"
            onClick={() => {
              setSelectedStudent(student);
              setShowAwardPanel(true);
            }}
          >
            <div className="student-avatar">{student.avatar_url}</div>
            <h3>{student.name}</h3>
            <div className="student-stats">
              <div className="stat">
                <span className="stat-label">Strengths:</span>
                <span className="stat-value purple">{student.strength_points}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Needs:</span>
                <span className="stat-value red">{student.need_points}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Award Magic Panel */}
      {showAwardPanel && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowAwardPanel(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2>Award Magic for {selectedStudent.name}</h2>
            <p>Choose a magical award to give:</p>
            
            <div className="award-magic-section">
              <div className="award-category">
                <h3>Positive Magic</h3>
                <div className="award-buttons">
                  {['Participation', 'Kindness', 'Focus', 'Helping Others', 'Creativity', 'Leadership'].map((award) => (
                    <button 
                      key={award}
                      className="award-btn strength"
                      onClick={() => handleAddAward(selectedStudent, 'strength', award)}
                    >
                      <span className="award-icon">⭐</span>
                      <span>{award}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="award-category">
                <h3>Magic Reminders</h3>
                <div className="award-buttons">
                  {['Needs Focus', 'Be Respectful', 'Complete Work', 'Stay Organized', 'Follow Rules', 'Self-Advocacy'].map((award) => (
                    <button 
                      key={award}
                      className="award-btn need"
                      onClick={() => handleAddAward(selectedStudent, 'need', award)}
                    >
                      <span className="award-icon">🔴</span>
                      <span>{award}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button className="close-modal" onClick={() => setShowAwardPanel(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="live-activity-feed">
        <h2>Live Snapshot Feed</h2>
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
  );
};

export default AwardSystem;
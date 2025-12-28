import React, { useState, useEffect } from 'react';
import { useClassContext } from '../contexts/ClassContext';
import { useActivityContext } from './LiveSnapshot';

const AwardSystem = () => {
  const { students, updateStudentPoints, loading } = useClassContext();
  const { activities, addActivity } = useActivityContext();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAwardPanel, setShowAwardPanel] = useState(false);

  const handleAddAward = (student, type, awardName) => {
    updateStudentPoints(student.id, type, 1);
    addActivity(student.name, awardName, type);
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
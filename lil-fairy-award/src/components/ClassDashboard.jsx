import React, { useState } from 'react';
import { useClassContext } from '../contexts/ClassContext';

const ClassDashboard = () => {
  const { classes, selectedClass, setSelectedClass, getStudentsByClass, updateStudentPoints, loading } = useClassContext();
  const [showGiveMagicModal, setShowGiveMagicModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = getStudentsByClass(selectedClass?.id);

  const handleGiveMagic = (student) => {
    setSelectedStudent(student);
    setShowGiveMagicModal(true);
  };

  const handleAddStrength = () => {
    if (selectedStudent) {
      updateStudentPoints(selectedStudent.id, 'strength', 1);
      setShowGiveMagicModal(false);
    }
  };

  const handleAddNeed = () => {
    if (selectedStudent) {
      updateStudentPoints(selectedStudent.id, 'need', 1);
      setShowGiveMagicModal(false);
    }
  };

  if (loading) {
    return <div className="class-dashboard">Loading...</div>;
  }

  return (
    <div className="class-dashboard">
      <h1>Class Dashboard</h1>
      
      <div className="class-selector">
        <h2>Select Class</h2>
        <div className="class-buttons">
          {classes.map(cls => (
            <button
              key={cls.id}
              className={`class-btn ${selectedClass?.id === cls.id ? 'active' : ''}`}
              onClick={() => setSelectedClass(cls)}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      <div className="student-grid">
        {filteredStudents.map(student => (
          <div 
            key={student.id} 
            className="student-card"
            onClick={() => handleGiveMagic(student)}
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

      {/* Give Magic Modal */}
      {showGiveMagicModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Give Magic to {selectedStudent.name}</h2>
            <div className="award-options">
              <button 
                className="award-btn strength"
                onClick={handleAddStrength}
              >
                <span className="award-icon">⭐</span>
                <span>Strength</span>
              </button>
              <button 
                className="award-btn need"
                onClick={handleAddNeed}
              >
                <span className="award-icon">🔴</span>
                <span>Need</span>
              </button>
            </div>
            <button 
              className="close-modal"
              onClick={() => setShowGiveMagicModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDashboard;
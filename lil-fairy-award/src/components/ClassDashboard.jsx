import React, { useState } from 'react';
import { useClassContext } from '../contexts/ClassContext';

const ClassDashboard = () => {
  const { classes, selectedClass, setSelectedClass, students, addStudent, updateStudentPoints, loading } = useClassContext();
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('👤');
  const [showGiveMagicModal, setShowGiveMagicModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (newStudentName.trim() && selectedClass) {
      addStudent({
        name: newStudentName.trim(),
        class_id: selectedClass.id,
        strength_points: 0,
        need_points: 0,
        avatar_url: newStudentAvatar
      });
      setNewStudentName('');
    }
  };

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

  const avatarOptions = ['👤', '👧', '👦', '👩‍🦰', '👨‍🦱', '👧‍🦱', '👦‍🦱', '👩‍🦳', '👨‍🦳', '👩‍💻', '👨‍💻', '👩‍🏫', '👨‍🏫', '👩‍🎓', '👨‍🎓'];

  if (loading) {
    return <div className="class-dashboard">Loading...</div>;
  }

  return (
    <div className="class-dashboard">
      <h1>Interactive Classroom Dashboard</h1>
      
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

      {selectedClass && (
        <div className="selected-class-info">
          <h2>{selectedClass.name}</h2>
          <p>{selectedClass.description}</p>
          
          <div className="add-student-form glass">
            <h3>Add New Student</h3>
            <form onSubmit={handleAddStudent}>
              <input
                type="text"
                placeholder="Student name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
              />
              <div className="avatar-selector">
                <label>Select Avatar:</label>
                <div className="avatar-options">
                  {avatarOptions.map(avatar => (
                    <span
                      key={avatar}
                      className={`avatar-option ${newStudentAvatar === avatar ? 'selected' : ''}`}
                      onClick={() => setNewStudentAvatar(avatar)}
                    >
                      {avatar}
                    </span>
                  ))}
                </div>
              </div>
              <button type="submit">Add Student</button>
            </form>
          </div>
          
          <div className="student-grid">
            {students.map(student => (
              <div 
                key={student.id} 
                className="student-card glass"
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
        </div>
      )}

      {/* Give Magic Modal */}
      {showGiveMagicModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowGiveMagicModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2>Award Magic to {selectedStudent.name}</h2>
            <p>Choose a magical award to give:</p>
            
            <div className="award-magic-section">
              <div className="award-category">
                <h3>Positive Magic</h3>
                <div className="award-buttons">
                  {['Participation', 'Kindness', 'Focus', 'Helping Others', 'Creativity', 'Leadership'].map((award) => (
                    <button 
                      key={award}
                      className="award-btn strength"
                      onClick={() => {
                        updateStudentPoints(selectedStudent.id, 'strength', 1);
                        setShowGiveMagicModal(false);
                      }}
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
                      onClick={() => {
                        updateStudentPoints(selectedStudent.id, 'need', 1);
                        setShowGiveMagicModal(false);
                      }}
                    >
                      <span className="award-icon">🔴</span>
                      <span>{award}</span>
                    </button>
                  ))}
                </div>
              </div>
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
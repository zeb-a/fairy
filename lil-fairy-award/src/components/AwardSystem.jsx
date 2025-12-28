import React, { useState, useEffect } from 'react';
import { useClassContext } from '../contexts/ClassContext';
import { useActivityContext } from './LiveSnapshot';
import { resolveAvatarUrl } from '../utils/avatarUtils';
import supabaseService from '../services/supabaseService';
import LiveSnapshotFeed from './LiveSnapshotFeed';

const AwardSystem = () => {
  const { students, updateStudentPoints, loading } = useClassContext();
  const { activities, addActivity } = useActivityContext();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAwardPanel, setShowAwardPanel] = useState(false);

  const handleAddAward = async (student, type, awardName) => {
    // Add to the database
    const newPoint = await updateStudentPoints(student.id, type, 1, awardName);
    
    if (newPoint) {
      // Add to the activity feed
      addActivity(student.name, awardName, type);
      
      // Visual feedback based on award type
      if (type === 'strength') {
        // Trigger confetti effect for strength awards
        triggerConfetti();
        // Play "Ding" sound
        playSound('ding');
      } else {
        // Play "Boop" sound for need reminders
        playSound('boop');
      }
    }
    
    setShowAwardPanel(false);
    setSelectedStudent(null);
  };

  // Function to trigger confetti effect (custom implementation)
  const triggerConfetti = () => {
    // Create confetti elements dynamically
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      
      // Position at top center of screen
      confetti.style.left = '50%';
      confetti.style.top = '20%';
      
      document.body.appendChild(confetti);
      
      // Animate confetti
      const animation = confetti.animate([
        { 
          transform: 'translate(0, 0) rotate(0deg)',
          opacity: 1
        },
        { 
          transform: `translate(${(Math.random() - 0.5) * 300}px, ${Math.random() * 400 + 200}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0
        }
      ], {
        duration: Math.random() * 1000 + 2000,
        easing: 'cubic-bezier(0,0,0.2,1)'
      });
      
      // Remove confetti element after animation completes
      animation.onfinish = () => {
        confetti.remove();
      };
    }
  };

  // Function to play sound effects
  const playSound = (type) => {
    // Create audio context and generate simple tones
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'ding') {
        // Higher pitch for ding
        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';
      } else {
        // Lower pitch for boop
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'square';
      }
      
      // Configure volume envelope
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // Play for 0.5 seconds
    } catch (e) {
      // If Web Audio API is not supported, skip sound
      console.log(`Sound ${type} played (Web Audio API not supported)`);
    }
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
            <div className="student-avatar">{resolveAvatarUrl(student.avatar_url)}</div>
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
      
      <div className="live-activity-section">
        <LiveSnapshotFeed maxItems={5} />
      </div>
    </div>
  );
};

export default AwardSystem;
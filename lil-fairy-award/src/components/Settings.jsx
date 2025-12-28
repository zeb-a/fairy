import React, { useState } from 'react';

const Settings = () => {
  const [userData, setUserData] = useState({
    fullName: 'Teacher Name',
    avatarSelection: '👩‍🏫',
    email: 'teacher@example.com'
  });

  const [classData, setClassData] = useState([
    { id: 1, name: 'Class A', description: 'First grade class' },
    { id: 2, name: 'Class B', description: 'Second grade class' }
  ]);

  const [newClass, setNewClass] = useState({ name: '', description: '' });

  const handleUserUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would update the user in the database
    alert('User profile updated!');
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (newClass.name.trim()) {
      const newClassObj = {
        id: classData.length + 1,
        name: newClass.name,
        description: newClass.description
      };
      setClassData([...classData, newClassObj]);
      setNewClass({ name: '', description: '' });
    }
  };

  return (
    <div className="settings">
      <h1>Account Settings</h1>
      
      <div className="settings-grid">
        <div className="profile-section">
          <h2>Profile Settings</h2>
          <form onSubmit={handleUserUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={userData.fullName}
                onChange={(e) => setUserData({...userData, fullName: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Avatar Selection</label>
              <div className="avatar-options">
                <span 
                  className={`avatar-option ${userData.avatarSelection === '👩‍🏫' ? 'selected' : ''}`}
                  onClick={() => setUserData({...userData, avatarSelection: '👩‍🏫'})}
                >
                  👩‍🏫
                </span>
                <span 
                  className={`avatar-option ${userData.avatarSelection === '👨‍🏫' ? 'selected' : ''}`}
                  onClick={() => setUserData({...userData, avatarSelection: '👨‍🏫'})}
                >
                  👨‍🏫
                </span>
                <span 
                  className={`avatar-option ${userData.avatarSelection === '👩‍🎓' ? 'selected' : ''}`}
                  onClick={() => setUserData({...userData, avatarSelection: '👩‍🎓'})}
                >
                  👩‍🎓
                </span>
                <span 
                  className={`avatar-option ${userData.avatarSelection === '🎓' ? 'selected' : ''}`}
                  onClick={() => setUserData({...userData, avatarSelection: '🎓'})}
                >
                  🎓
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            </div>
            
            <button type="submit">Update Profile</button>
          </form>
        </div>

        <div className="class-management">
          <h2>Class Management</h2>
          
          <div className="add-class-form">
            <h3>Add New Class</h3>
            <form onSubmit={handleAddClass}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                />
              </div>
              <button type="submit">Add Class</button>
            </form>
          </div>
          
          <div className="existing-classes">
            <h3>Existing Classes</h3>
            <div className="class-list">
              {classData.map(cls => (
                <div key={cls.id} className="class-item">
                  <h4>{cls.name}</h4>
                  <p>{cls.description}</p>
                  <div className="class-actions">
                    <button>Edit</button>
                    <button>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
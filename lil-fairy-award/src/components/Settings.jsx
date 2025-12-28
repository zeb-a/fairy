import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import supabaseService from '../services/supabaseService';
import { resolveAvatarUrl } from '../utils/avatarUtils';

const Settings = () => {
  const { user, updateUser, updateAvatar, updatePassword } = useUser();
  const [userData, setUserData] = useState({
    displayName: user.displayName,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const fileInputRef = useRef(null);

  // Magical emojis for avatar selection
  const magicalEmojis = ['🧙', '✨', '🦄', '🧚', '🍎'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmojiSelect = (emoji) => {
    updateAvatar(emoji, 'emoji');
    setMessage('Avatar updated successfully!');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('File size too large. Please select an image under 5MB.');
        setMessageType('error');
        return;
      }

      setLoading(true);
      try {
        // Upload to Supabase storage
        const uploadResult = await supabaseService.storage.uploadAvatar(file, user.id);
        
        if (uploadResult.error) {
          throw new Error(uploadResult.error.message);
        }
        
        // Get the public URL and update the avatar
        const publicUrl = uploadResult.data.publicUrl;
        updateAvatar(publicUrl, 'image', publicUrl);
        setMessage('Avatar updated successfully!');
        setMessageType('success');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setMessage(`Error uploading avatar: ${error.message}`);
        setMessageType('error');
      } finally {
        setLoading(false);
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update user profile
      await updateUser({
        displayName: userData.displayName,
        email: userData.email
      });
      
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (userData.newPassword !== userData.confirmNewPassword) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    if (userData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    try {
      // In a real app, this would call an API to update the password
      // For now, we'll simulate the update
      const result = await updatePassword(userData.currentPassword, userData.newPassword);
      
      if (result.success) {
        setMessage('Password updated successfully!');
        setMessageType('success');
        // Clear password fields after successful update
        setUserData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      } else {
        setMessage(result.message || 'Error updating password.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error updating password. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="settings">
      <h1>Account Settings</h1>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="settings-grid">
        <div className="profile-section glass">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={userData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                readOnly
                disabled
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-spinner">Saving...</span>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        <div className="avatar-section glass">
          <h2>Avatar Settings</h2>
          <div className="current-avatar">
            <div className="avatar-preview" style={{ fontSize: '3rem' }}>
              {resolveAvatarUrl(user.avatar)}
            </div>
            <p>Current Avatar</p>
          </div>
          
          <div className="avatar-options">
            <div className="emoji-options">
              <h3>Select Magical Emoji</h3>
              <div className="emoji-grid">
                {magicalEmojis.map((emoji, index) => (
                  <span
                    key={index}
                    className={`avatar-option ${user.avatar === emoji ? 'selected' : ''}`}
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="divider">OR</div>
            
            <div className="image-upload">
              <h3>Upload Your Photo</h3>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                className="upload-btn"
                onClick={triggerFileInput}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Choose Image'}
              </button>
            </div>
          </div>
        </div>

        <div className="password-section glass">
          <h2>Security Settings</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={userData.currentPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={userData.newPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={userData.confirmNewPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-spinner">Updating...</span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
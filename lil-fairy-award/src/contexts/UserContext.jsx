import React, { createContext, useContext, useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser 
      ? JSON.parse(savedUser)
      : {
          id: null,
          displayName: 'Teacher Name',
          email: 'teacher@example.com',
          avatar: '🧙',
          avatarType: 'emoji', // 'emoji' or 'image'
          avatarUrl: null,
          avatar_selection: '🧙',
        };
  });

  // Auto-fetch teacher profile on initial load
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      // Get the current user from Supabase auth
      const currentUser = supabaseService.auth.getCurrentUser();
      const { data: teacherProfile, error } = await supabaseService.db.getTeacherProfile(currentUser.id);
      
      if (!error && teacherProfile) {
        setUser(prev => ({
          ...prev,
          id: teacherProfile.id,
          displayName: teacherProfile.full_name || prev.displayName,
          email: teacherProfile.email || prev.email,
          avatar: teacherProfile.avatar_selection || prev.avatar,
          avatar_selection: teacherProfile.avatar_selection || prev.avatar_selection
        }));
      }
    };

    fetchTeacherProfile();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const updateUser = async (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));

    // Update in Supabase
    if (user.id) {
      const profileData = {
        full_name: userData.displayName || user.displayName,
        email: userData.email || user.email
      };
      await supabaseService.db.updateTeacherProfile(user.id, profileData);
    }
  };

  const updateAvatar = async (avatar, avatarType, avatarUrl = null) => {
    setUser(prev => ({
      ...prev,
      avatar,
      avatarType,
      avatarUrl,
      avatar_selection: avatar
    }));

    // Update in Supabase
    if (user.id) {
      await supabaseService.db.updateTeacherProfile(user.id, { avatar_selection: avatar });
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    // In a real app, this would make an API call to update the password
    // For now, we'll just return a success response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Password updated successfully' });
      }, 1000);
    });
  };

  const value = {
    user,
    updateUser,
    updateAvatar,
    updatePassword
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
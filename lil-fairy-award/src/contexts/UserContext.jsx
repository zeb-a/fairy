import React, { createContext, useContext, useState, useEffect } from 'react';

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
          displayName: 'Teacher Name',
          email: 'teacher@example.com',
          avatar: '🧙',
          avatarType: 'emoji', // 'emoji' or 'image'
          avatarUrl: null,
        };
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  const updateAvatar = (avatar, avatarType, avatarUrl = null) => {
    setUser(prev => ({
      ...prev,
      avatar,
      avatarType,
      avatarUrl
    }));
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
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    const checkAuthState = async () => {
      const { data: { user: currentUser } } = await supabaseService.auth.getCurrentUser();
      
      if (currentUser) {
        // Fetch teacher profile
        const { data: teacherProfile, error } = await supabaseService.db.getTeacherProfile(currentUser.id);
        
        if (!error && teacherProfile) {
          setUser({
            id: teacherProfile.id,
            displayName: teacherProfile.full_name || currentUser.email.split('@')[0],
            email: teacherProfile.email || currentUser.email,
            avatar: teacherProfile.avatar_selection || '🧙',
            avatarType: 'emoji', // 'emoji' or 'image'
            avatarUrl: null,
            avatar_selection: teacherProfile.avatar_selection || '🧙',
          });
        } else {
          // Create a basic user object if profile doesn't exist
          setUser({
            id: currentUser.id,
            displayName: currentUser.email.split('@')[0],
            email: currentUser.email,
            avatar: '🧙',
            avatarType: 'emoji',
            avatarUrl: null,
            avatar_selection: '🧙',
          });
        }
      }
      
      setLoading(false);
    };

    checkAuthState();

    // Set up auth state listener
    const { data: { subscription } } = supabaseService.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch teacher profile
          const { data: teacherProfile, error } = await supabaseService.db.getTeacherProfile(session.user.id);
          
          if (!error && teacherProfile) {
            setUser({
              id: teacherProfile.id,
              displayName: teacherProfile.full_name || session.user.email.split('@')[0],
              email: teacherProfile.email || session.user.email,
              avatar: teacherProfile.avatar_selection || '🧙',
              avatarType: 'emoji', // 'emoji' or 'image'
              avatarUrl: null,
              avatar_selection: teacherProfile.avatar_selection || '🧙',
            });
          } else {
            // Create a basic user object if profile doesn't exist
            setUser({
              id: session.user.id,
              displayName: session.user.email.split('@')[0],
              email: session.user.email,
              avatar: '🧙',
              avatarType: 'emoji',
              avatarUrl: null,
              avatar_selection: '🧙',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
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
    loading,
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
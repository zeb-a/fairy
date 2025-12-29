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
    // Check current auth state with timeout to prevent hanging
    const checkAuthState = async () => {
      try {
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth state check timeout')), 15000); // 15 second timeout
        });

        // Race the auth check with timeout
        const authCheckPromise = supabaseService.auth.getCurrentUser();
        
        const result = await Promise.race([authCheckPromise, timeoutPromise]);
        
        const { data: { user: currentUser }, error: userError } = result;
        
        if (userError) {
          console.error('Error getting current user:', userError);
          setLoading(false);
          return;
        }
        
        if (currentUser) {
          try {
            // Fetch teacher profile with timeout
            const profileTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
            });

            const profilePromise = supabaseService.db.getTeacherProfile(currentUser.id);
            const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]);
            
            if (!profileResult.error && profileResult.data) {
              setUser({
                id: profileResult.data.id,
                displayName: profileResult.data.full_name || currentUser.email.split('@')[0],
                email: profileResult.data.email || currentUser.email,
                avatar: profileResult.data.avatar_selection || '🧙',
                avatarType: 'emoji', // 'emoji' or 'image'
                avatarUrl: null,
                avatar_selection: profileResult.data.avatar_selection || '🧙',
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
          } catch (profileError) {
            console.error('Error fetching teacher profile:', profileError);
            // Still set basic user info if profile fetch fails
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
      } catch (error) {
        console.error('Error in auth state check:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();

    // Set up auth state listener
    const { data: { subscription } } = supabaseService.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Fetch teacher profile with timeout
            const profileTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
            });

            const profilePromise = supabaseService.db.getTeacherProfile(session.user.id);
            const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]);
            
            if (!profileResult.error && profileResult.data) {
              setUser({
                id: profileResult.data.id,
                displayName: profileResult.data.full_name || session.user.email.split('@')[0],
                email: profileResult.data.email || session.user.email,
                avatar: profileResult.data.avatar_selection || '🧙',
                avatarType: 'emoji', // 'emoji' or 'image'
                avatarUrl: null,
                avatar_selection: profileResult.data.avatar_selection || '🧙',
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
          } catch (profileError) {
            console.error('Error fetching teacher profile after sign in:', profileError);
            // Still set basic user info if profile fetch fails
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
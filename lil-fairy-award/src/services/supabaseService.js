import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = 'https://jbmpfczuyspgxgqvejuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibXBmY3p1eXNwZ3hncXZlanVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NzI0NjUsImV4cCI6MjA4MjQ0ODQ2NX0.B-pyr_bsUYpU8eHAvBR-HWqj33ocEJw7EfCtFs8Meko';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle errors and implement silent retries with timeout
const handleOperation = async (operation, retries = 3, timeoutMs = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      // Race the operation with timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      if (result.error) {
        console.warn(`Operation failed, attempt ${i + 1}/${retries}:`, result.error);
        if (i === retries - 1) {
          return result; // Return the last error
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        return result;
      }
    } catch (error) {
      console.warn(`Operation failed with exception, attempt ${i + 1}/${retries}:`, error);
      if (i === retries - 1) {
        return { error };
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const supabaseService = {
  // Direct access to the supabase client
  client: supabase,
  // Auth functions
  auth: {
    signIn: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Supabase auth error:', error);
          return { user: null, error: error.message };
        }
        
        // Create profile if it doesn't exist - do this asynchronously so it doesn't block login
        if (data?.user) {
          // Run profile creation in the background without waiting for it
          supabaseService.db.createProfileIfNotExists(data.user.id, data.user.email, null)
            .catch(err => console.warn('Profile creation failed:', err));
        }
        
        return { user: data?.user, error: null };
      } catch (err) {
        console.error('Unexpected error during sign in:', err);
        return { user: null, error: err.message || 'Authentication failed' };
      }
    },
    
    signUp: async (email, password, fullName) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: window.location.origin // This helps with email confirmation flow
          }
        });
        
        if (error) {
          console.error('Supabase signup error:', error);
          return { user: null, error: error.message };
        }
        
        // For new signups, the user might need to confirm email
        // If email confirmation is required, data.user will be the user object but they might not be logged in yet
        if (data?.user) {
          // If user is already logged in (email autoconfirm is enabled), create profile
          if (data.session) {
            // Run profile creation in the background without waiting for it
            supabaseService.db.createProfileIfNotExists(data.user.id, email, fullName)
              .catch(err => console.warn('Profile creation failed:', err));
            return { user: data.user, error: null };
          } else {
            // User needs to confirm email - return the user object but indicate they need to confirm
            return { user: data.user, error: null, needsConfirmation: true };
          }
        }
        
        return { user: null, error: null };
      } catch (err) {
        console.error('Unexpected error during sign up:', err);
        return { user: null, error: err.message || 'Signup failed' };
      }
    },
    
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    },
    
    getCurrentUser: async () => {
      try {
        return await supabase.auth.getUser();
      } catch (error) {
        console.error('Error getting current user:', error);
        return { data: { user: null }, error };
      }
    },
    
    onAuthStateChange: (callback) => {
      return supabase.auth.onAuthStateChange(callback);
    }
  },

  // Database functions
  db: {
    // Teachers operations
    getTeacherProfile: async (userId) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', userId)
          .single();
        
        return { data, error };
      }, 3, 15000); // 3 retries, 15 second timeout
      
      return result;
    },

    createProfileIfNotExists: async (userId, email, fullName = null) => {
      const result = await handleOperation(async () => {
        // First check if the profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (fetchError && fetchError.code === 'PGRST116') { // Record not found
          // Create a new teacher profile
          const newTeacher = {
            id: userId,
            full_name: fullName || email.split('@')[0], // Use fullName if provided, else derive from email
            email: email,
            avatar_selection: '🧙', // Default avatar
            created_at: new Date().toISOString()
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('teachers')
            .insert([newTeacher])
            .select()
            .single();
            
          return { data: insertData, error: insertError };
        }
        
        // Profile already exists, return existing data
        return { data: existingProfile, error: null };
      }, 3, 15000); // 3 retries, 15 second timeout
      
      return result;
    },
    
    updateTeacherProfile: async (userId, profileData) => {
      const result = await handleOperation(async () => {
        // First try to get the existing teacher
        const { data: existingTeacher, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (fetchError && fetchError.code === 'PGRST116') {
          // Teacher doesn't exist, create with provided data
          const newTeacher = {
            id: userId,
            ...profileData,
            created_at: new Date().toISOString()
          };
          
          const { data, error } = await supabase
            .from('teachers')
            .insert([newTeacher])
            .select()
            .single();
            
          return { data, error };
        } else if (fetchError) {
          // Some other error occurred
          return { data: null, error: fetchError };
        }
        
        // Teacher exists, update the profile
        const { data, error } = await supabase
          .from('teachers')
          .update(profileData)
          .eq('id', userId)
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },

    // Classes operations
    getClasses: async (userId) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('classes')
          .select('id, class_name, description, teacher_id, created_at')
          .eq('teacher_id', userId);
        
        // Map class_name to name for consistency with frontend expectations
        const mappedData = data?.map(item => ({
          ...item,
          name: item.class_name
        }));
        
        return { data: mappedData, error };
      });
      
      return result;
    },
    
    createClass: async (className, description, teacherId) => {
      const classData = { class_name: className, teacher_id: teacherId };
      // Only add description if it's provided
      if (description) {
        classData.description = description;
      }
      
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('classes')
          .insert([classData])
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },
    
    updateClass: async (classId, updates) => {
      const result = await handleOperation(async () => {
        // Filter out undefined or null values from updates to avoid invalid fields
        const filteredUpdates = {};
        if (updates.name !== undefined && updates.name !== null) {
          filteredUpdates.class_name = updates.name.trim();
        }
        if (updates.description !== undefined && updates.description !== null) {
          filteredUpdates.description = updates.description.trim();
        }
        
        // Only proceed if there are actual updates to make
        if (Object.keys(filteredUpdates).length === 0) {
          return { data: null, error: { message: 'No valid updates provided' } };
        }
        
        const { data, error } = await supabase
          .from('classes')
          .update(filteredUpdates)
          .eq('id', classId)
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },

    deleteClass: async (classId) => {
      const result = await handleOperation(async () => {
        // Delete all students in the class first (cascade delete)
        await supabase.from('students').delete().eq('class_id', classId);
        
        // Then delete the class
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('id', classId);
        
        return { error };
      });
      
      return result;
    },

    // Students operations
    getStudents: async (classId) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId);
        
        return { data, error };
      });
      
      return result;
    },
    
    createStudent: async (studentData) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('students')
          .insert([studentData])
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },
    
    updateStudent: async (studentId, updates) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('students')
          .update(updates)
          .eq('id', studentId)
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },
    
    deleteStudent: async (studentId) => {
      const result = await handleOperation(async () => {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId);
        
        return { error };
      });
      
      return result;
    },

    // Tasks operations
    getTasks: async (classId) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('class_id', classId);
        
        return { data, error };
      });
      
      return result;
    },
    
    createTask: async (taskData) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },

    // Point log operations
    getPointLog: async (classId) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('points_log')
          .select(`
            *,
            students(name),
            tasks(title, point_type)
          `)
          .eq('class_id', classId)
          .order('created_at', { ascending: false })
          .limit(50); // Limit to last 50 entries
        
        return { data, error };
      });
      
      return result;
    },
    
    addPoint: async (studentId, taskId, pointType, classId, rewardType = 'Award') => {
      const result = await handleOperation(async () => {
        // Get the student first to update their points
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('strength_points, need_points')
          .eq('id', studentId)
          .single();
        
        if (studentError) {
          return { error: studentError };
        }
        
        // Determine the field to update based on point type
        let updateField;
        if (pointType === 'strength') {
          updateField = { strength_points: student.strength_points + 1 };
        } else {
          updateField = { need_points: student.need_points + 1 };
        }
        
        // Update the student's points
        const { error: updateError } = await supabase
          .from('students')
          .update(updateField)
          .eq('id', studentId);
        
        if (updateError) {
          return { error: updateError };
        }
        
        // Add to the point log
        const pointLogData = {
          student_id: studentId,
          task_id: taskId,
          class_id: classId,
          point_type: pointType
        };
        
        // Add reward_type if provided (only if the column exists in the table)
        if (rewardType) {
          pointLogData.reward_type = rewardType;
        }
        
        const { data: pointLog, error: logError } = await supabase
          .from('points_log')
          .insert([pointLogData])
          .select()
          .single();
        
        if (logError) {
          return { error: logError };
        }
        
        return { data: pointLog, error: null };
      });
      
      return result;
    }
  },
  
  // Storage functions for avatars
  storage: {
    uploadAvatar: async (file, userId) => {
      const result = await handleOperation(async () => {
        if (!userId) {
          return { error: new Error('User ID is required for avatar upload') };
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId.replace(/[^a-zA-Z0-9]/g, '_')}/${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          return { error: uploadError };
        }
        
        // Get public URL
        const { data } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        return { data: { path: filePath, publicUrl: data.publicUrl }, error: null };
      });
      
      return result;
    },
    
    getPublicUrl: async (filePath) => {
      const { data } = await supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      return data.publicUrl;
    }
  },
  
  // Realtime functions
  realtime: {
    subscribeToPoints: (callback) => {
      const channel = supabase
        .channel('points-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'points_log',
          },
          (payload) => {
            callback(payload.new);
          }
        )
        .subscribe();
      
      return channel;
    },
    
    unsubscribe: (channel) => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    }
  }
};

export default supabaseService;
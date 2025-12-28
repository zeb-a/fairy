import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = 'https://jbmpfczuyspgxgqvejuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibXBmY3p1eXNwZ3hncXZlanVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NzI0NjUsImV4cCI6MjA4MjQ0ODQ2NX0.B-pyr_bsUYpU8eHAvBR-HWqj33ocEJw7EfCtFs8Meko';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle errors and implement silent retries
const handleOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await operation();
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
  // Auth functions
  auth: {
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { user: null, error: error.message };
      }
      
      // Create profile if it doesn't exist
      if (data.user) {
        await supabaseService.db.createProfileIfNotExists(data.user.id, data.user.email);
      }
      
      return { user: data.user, error: null };
    },
    
    signUp: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        return { user: null, error: error.message };
      }
      
      // Create profile for the new user
      if (data.user) {
        await supabaseService.db.createProfileIfNotExists(data.user.id, email, fullName);
      }
      
      return { user: data.user, error: null };
    },
    
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    },
    
    getCurrentUser: () => {
      return supabase.auth.getUser();
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
      });
      
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
      });
      
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
          .select('*')
          .eq('teacher_id', userId);
        
        return { data, error };
      });
      
      return result;
    },
    
    createClass: async (className, description, teacherId) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('classes')
          .insert([{ name: className, description, teacher_id: teacherId }])
          .select()
          .single();
        
        return { data, error };
      });
      
      return result;
    },
    
    updateClass: async (classId, updates) => {
      const result = await handleOperation(async () => {
        const { data, error } = await supabase
          .from('classes')
          .update(updates)
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
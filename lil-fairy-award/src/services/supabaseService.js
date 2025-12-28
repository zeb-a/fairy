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
      // Note: In a real application, you would use Supabase's auth
      // For now, we'll keep it as a mock since we're using anonymous auth
      return {
        user: { id: 'user1', email, full_name: 'Teacher Name', avatar_selection: '👩‍🏫' },
        error: null
      };
    },
    
    signUp: async (email, password, fullName) => {
      // Note: In a real application, you would use Supabase's auth
      return {
        user: { id: 'user2', email, full_name: fullName, avatar_selection: '👩‍🏫' },
        error: null
      };
    },
    
    signOut: async () => {
      return { error: null };
    },
    
    getCurrentUser: () => {
      // Mock current user - in real app this would use Supabase auth
      return { id: 'user1', email: 'teacher@example.com', full_name: 'Teacher Name', avatar_selection: '👩‍🏫' };
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
    
    updateTeacherProfile: async (userId, profileData) => {
      const result = await handleOperation(async () => {
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
    
    addPoint: async (studentId, taskId, pointType, classId) => {
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
        const { data: pointLog, error: logError } = await supabase
          .from('points_log')
          .insert([{
            student_id: studentId,
            task_id: taskId,
            class_id: classId,
            point_type: pointType
          }])
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Math.random()}.${fileExt}`;
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
    
    getPublicUrl: (filePath) => {
      const { data } = supabase
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
// Mock Supabase service for Lil Fairy Award
// In a real application, this would connect to actual Supabase services

const supabaseService = {
  // Auth functions
  auth: {
    signIn: async (email, password) => {
      // Mock sign in
      return {
        user: { id: 'user1', email, full_name: 'Teacher Name', avatar_selection: '👩‍🏫' },
        error: null
      };
    },
    
    signUp: async (email, password, fullName) => {
      // Mock sign up
      return {
        user: { id: 'user2', email, full_name: fullName, avatar_selection: '👩‍🏫' },
        error: null
      };
    },
    
    signOut: async () => {
      // Mock sign out
      return { error: null };
    },
    
    getCurrentUser: () => {
      // Mock current user
      return { id: 'user1', email: 'teacher@example.com', full_name: 'Teacher Name', avatar_selection: '👩‍🏫' };
    }
  },

  // Database functions
  db: {
    // Classes operations
    getClasses: async (userId) => {
      return {
        data: [
          { id: 1, name: 'Class A', description: 'First grade class', teacher_id: userId },
          { id: 2, name: 'Class B', description: 'Second grade class', teacher_id: userId },
          { id: 3, name: 'Class C', description: 'Third grade class', teacher_id: userId }
        ],
        error: null
      };
    },
    
    createClass: async (className, description, teacherId) => {
      const newClass = {
        id: Date.now(),
        name: className,
        description,
        teacher_id: teacherId
      };
      return { data: newClass, error: null };
    },
    
    deleteClass: async (classId) => {
      return { error: null };
    },

    // Students operations
    getStudents: async (classId) => {
      const mockStudents = {
        1: [
          { id: 1, name: 'Emma Johnson', class_id: 1, strength_points: 15, need_points: 3, avatar_url: '👩‍🦰' },
          { id: 2, name: 'Michael Chen', class_id: 1, strength_points: 12, need_points: 5, avatar_url: '👦' },
          { id: 3, name: 'Sophia Williams', class_id: 1, strength_points: 18, need_points: 2, avatar_url: '👧' },
          { id: 4, name: 'James Wilson', class_id: 1, strength_points: 8, need_points: 8, avatar_url: '👦' },
        ],
        2: [
          { id: 5, name: 'Olivia Davis', class_id: 2, strength_points: 10, need_points: 4, avatar_url: '👧' },
          { id: 6, name: 'William Brown', class_id: 2, strength_points: 14, need_points: 6, avatar_url: '👦' },
        ]
      };
      
      return {
        data: mockStudents[classId] || [],
        error: null
      };
    },
    
    createStudent: async (studentData) => {
      const newStudent = {
        ...studentData,
        id: Date.now()
      };
      return { data: newStudent, error: null };
    },
    
    updateStudent: async (studentId, updates) => {
      return { data: { id: studentId, ...updates }, error: null };
    },
    
    deleteStudent: async (studentId) => {
      return { error: null };
    },

    // Tasks operations
    getTasks: async (classId) => {
      return {
        data: [
          { id: 1, title: 'Good participation', point_type: 'positive', class_id: classId },
          { id: 2, title: 'Helping others', point_type: 'positive', class_id: classId },
          { id: 3, title: 'Focus improvement', point_type: 'reminder', class_id: classId },
        ],
        error: null
      };
    },
    
    createTask: async (taskData) => {
      const newTask = {
        ...taskData,
        id: Date.now()
      };
      return { data: newTask, error: null };
    },

    // Point log operations
    getPointLog: async (classId) => {
      return {
        data: [
          { id: 1, student_id: 1, task_id: 1, created_at: new Date().toISOString() },
          { id: 2, student_id: 2, task_id: 2, created_at: new Date().toISOString() },
          { id: 3, student_id: 3, task_id: 1, created_at: new Date().toISOString() },
        ],
        error: null
      };
    },
    
    addPoint: async (studentId, taskId, pointType) => {
      const newPoint = {
        id: Date.now(),
        student_id: studentId,
        task_id: taskId,
        created_at: new Date().toISOString()
      };
      return { data: newPoint, error: null };
    }
  }
};

export default supabaseService;
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import supabaseService from '../services/supabaseService';

const ClassContext = createContext();

export const useClassContext = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
};

export const ClassProvider = ({ children }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-fetch classes and students on initial load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Get the current user
      const currentUser = supabaseService.auth.getCurrentUser();
      
      // Get classes for the teacher
      const { data: classesData, error: classesError } = await supabaseService.db.getClasses(currentUser.id);
      
      if (!classesError && classesData) {
        setClasses(classesData);
        
        // If there are classes, get students for the first one
        if (classesData.length > 0) {
          const firstClass = classesData[0];
          setSelectedClass(firstClass);
          
          const { data: studentsData, error: studentsError } = await supabaseService.db.getStudents(firstClass.id);
          if (!studentsError) {
            setStudents(studentsData || []);
          }
        }
      }
      
      setLoading(false);
    };
    
    initializeData();
  }, []);

  // Set up Realtime subscriptions
  useEffect(() => {
    let pointsChannel;
    let studentsChannel;
    let classesChannel;

    const setupRealtimeSubscriptions = async () => {
      const currentUser = supabaseService.auth.getCurrentUser();
      
      // Subscribe to points changes
      pointsChannel = supabaseService.realtime.subscribeToPoints((payload) => {
        // When a point is added, we need to refresh the student data to get updated points
        if (selectedClass) {
          const fetchUpdatedStudents = async () => {
            const { data: freshStudents, error: fetchError } = await supabaseService.db.getStudents(selectedClass.id);
            if (!fetchError) {
              setStudents(freshStudents);
            }
          };
          fetchUpdatedStudents();
        }
      });

      // Subscribe to students changes
      studentsChannel = supabaseService
        .channel('students-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students',
          },
          (payload) => {
            // Refresh students for the currently selected class
            if (selectedClass && payload.new.class_id === selectedClass.id) {
              const fetchUpdatedStudents = async () => {
                const { data: freshStudents, error: fetchError } = await supabaseService.db.getStudents(selectedClass.id);
                if (!fetchError) {
                  setStudents(freshStudents);
                }
              };
              fetchUpdatedStudents();
            }
          }
        )
        .subscribe();

      // Subscribe to classes changes for the current user
      classesChannel = supabaseService
        .channel('classes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'classes',
            filter: `teacher_id=eq.${currentUser.id}`,
          },
          (payload) => {
            const fetchUpdatedClasses = async () => {
              const { data: freshClasses, error: fetchError } = await supabaseService.db.getClasses(currentUser.id);
              if (!fetchError) {
                setClasses(freshClasses);
                
                // If the selected class was updated, update it in state
                if (selectedClass) {
                  const updatedClass = freshClasses.find(cls => cls.id === selectedClass.id);
                  if (updatedClass) {
                    setSelectedClass(updatedClass);
                  }
                }
              }
            };
            fetchUpdatedClasses();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscriptions();

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (pointsChannel) {
        supabaseService.realtime.unsubscribe(pointsChannel);
      }
      if (studentsChannel) {
        supabase.removeChannel(studentsChannel);
      }
      if (classesChannel) {
        supabase.removeChannel(classesChannel);
      }
    };
  }, [selectedClass]);

  const value = {
    selectedClass,
    setSelectedClass,
    classes,
    setClasses,
    students,
    setStudents,
    loading,
    getStudentsByClass: (classId) => students.filter(student => student.class_id === classId),
    addStudent: async (studentData) => {
      const { data: newStudent, error } = await supabaseService.db.createStudent(studentData);
      if (!error && newStudent) {
        // Optimistic update: add the student to the local state immediately
        setStudents([...students, newStudent]);
        return newStudent;
      }
      return null;
    },
    updateStudentPoints: async (studentId, type, points) => {
      // Get the student to get their class_id
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      // Add point to the database which will automatically update the student's points
      const { data: newPoint, error } = await supabaseService.db.addPoint(
        studentId, 
        1, // Using a default task ID, in a real app this would come from context
        type === 'strength' ? 'positive' : 'reminder', 
        student.class_id
      );
      
      if (!error && newPoint) {
        // The realtime subscription will handle updating the student data
      }
    },
    addClass: async (classData) => {
      const currentUser = supabaseService.auth.getCurrentUser();
      const { data: newClass, error } = await supabaseService.db.createClass(
        classData.name, 
        classData.description, 
        currentUser.id
      );
      if (!error && newClass) {
        // Optimistic update: add the class to the local state immediately
        setClasses([...classes, newClass]);
        return newClass;
      }
      return null;
    },
    deleteClass: async (classId) => {
      const { error } = await supabaseService.db.deleteClass(classId);
      if (!error) {
        // Optimistic update: remove the class from local state immediately
        setClasses(classes.filter(cls => cls.id !== classId));
        // If the deleted class was the selected class, clear selection
        if (selectedClass?.id === classId) {
          setSelectedClass(null);
        }
        return true;
      }
      return false;
    },
    updateClass: async (classId, updates) => {
      const { data: updatedClass, error } = await supabaseService.db.updateClass(classId, updates);
      if (!error && updatedClass) {
        // Optimistic update: update the class in local state immediately
        setClasses(classes.map(cls => 
          cls.id === classId ? updatedClass : cls
        ));
        // If the updated class was the selected class, update selection
        if (selectedClass?.id === classId) {
          setSelectedClass(updatedClass);
        }
        return updatedClass;
      }
      return null;
    },
    deleteStudent: async (studentId) => {
      const { error } = await supabaseService.db.deleteStudent(studentId);
      if (!error) {
        // Optimistic update: remove the student from local state immediately
        setStudents(students.filter(student => student.id !== studentId));
        return true;
      }
      return false;
    }
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};
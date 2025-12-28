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
        // Refresh the students list to get updated points from the database
        const { data: freshStudents, error: fetchError } = await supabaseService.db.getStudents(student.class_id);
        if (!fetchError) {
          setStudents(freshStudents);
        }
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
        setClasses([...classes, newClass]);
        return newClass;
      }
      return null;
    }
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};
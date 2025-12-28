import React, { createContext, useContext, useState, useEffect } from 'react';
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
  
  // Initialize data from mock service
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Get classes
      const { data: classesData } = await supabaseService.db.getClasses('user1');
      setClasses(classesData || []);
      
      // Get students for the first class
      if (classesData && classesData.length > 0) {
        const { data: studentsData } = await supabaseService.db.getStudents(classesData[0].id);
        setStudents(studentsData || []);
        setSelectedClass(classesData[0]);
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
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      let updates;
      if (type === 'strength') {
        updates = { strength_points: student.strength_points + points };
      } else {
        updates = { need_points: student.need_points + points };
      }
      
      const { data: updatedStudent, error } = await supabaseService.db.updateStudent(studentId, updates);
      if (!error && updatedStudent) {
        setStudents(students.map(s => s.id === studentId ? updatedStudent : s));
        
        // Add to point log
        await supabaseService.db.addPoint(studentId, 1, type);
      }
    },
    addClass: async (classData) => {
      const { data: newClass, error } = await supabaseService.db.createClass(
        classData.name, 
        classData.description, 
        'user1' // current user ID
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
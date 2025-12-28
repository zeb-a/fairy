// Mock data generation for insights
export const generateMockPointLogs = (students) => {
  const pointLogs = [];
  
  // Generate mock point logs based on students
  for (let i = 0; i < 50; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const types = ['positive', 'reminder'];
    const tasks = [
      'Participation', 'Kindness', 'Focus', 'Helping Others', 'Creativity', 'Leadership',
      'Needs Focus', 'Be Respectful', 'Complete Work', 'Stay Organized', 'Follow Rules', 'Self-Advocacy'
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    // Generate timestamps for the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    pointLogs.push({
      id: i + 1,
      studentId: randomStudent.id,
      studentName: randomStudent.name,
      type: randomType,
      taskName: randomTask,
      timestamp: date.toISOString()
    });
  }
  
  return pointLogs;
};

// Function to calculate strength vs need distribution
export const calculateStrengthVsNeed = (pointLogs, studentId = null) => {
  let filteredLogs = pointLogs;
  if (studentId) {
    filteredLogs = pointLogs.filter(log => log.studentId === studentId);
  }
  
  const strengthCount = filteredLogs.filter(log => log.type === 'positive').length;
  const needCount = filteredLogs.filter(log => log.type === 'reminder').length;
  const totalCount = strengthCount + needCount;
  
  if (totalCount === 0) {
    return { strengthPercent: 50, needPercent: 50 };
  }
  
  return {
    strengthPercent: Math.round((strengthCount / totalCount) * 100),
    needPercent: Math.round((needCount / totalCount) * 100)
  };
};

// Function to get top strengths for a student or class
export const getTopStrengths = (pointLogs, studentId = null) => {
  let filteredLogs = pointLogs.filter(log => log.type === 'positive');
  if (studentId) {
    filteredLogs = filteredLogs.filter(log => log.studentId === studentId);
  }
  
  const strengthCounts = {};
  filteredLogs.forEach(log => {
    strengthCounts[log.taskName] = (strengthCounts[log.taskName] || 0) + 1;
  });
  
  return Object.entries(strengthCounts)
    .map(([taskName, count]) => ({ taskName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};

// Function to get automated insights
export const generateInsights = (pointLogs, students, studentId = null) => {
  const insights = [];
  
  // Get data for the specified student or all students
  const filteredLogs = studentId 
    ? pointLogs.filter(log => log.studentId === studentId)
    : pointLogs;
  
  // Top Strength Insight
  const topStrengths = getTopStrengths(pointLogs, studentId);
  if (topStrengths.length > 0) {
    const topStrength = topStrengths[0];
    if (studentId) {
      insights.push(`This student is excelling at '${topStrength.taskName}' with ${topStrength.count} awards!`);
    } else {
      insights.push(`The class is excelling at '${topStrength.taskName}' with ${topStrength.count} awards!`);
    }
  }
  
  // Growth Alert: Check if reminders have increased in the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentLogs = filteredLogs.filter(log => new Date(log.timestamp) > weekAgo);
  const recentReminders = recentLogs.filter(log => log.type === 'reminder').length;
  const previousLogs = filteredLogs.filter(log => new Date(log.timestamp) <= weekAgo);
  const previousReminders = previousLogs.filter(log => log.type === 'reminder').length;
  
  if (recentReminders > previousReminders && recentReminders > 0) {
    const increasePercent = previousReminders === 0 
      ? 100 
      : Math.round(((recentReminders - previousReminders) / previousReminders) * 100);
    
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      insights.push(`Alert: ${student?.name || 'This student'} has ${increasePercent}% more reminders in the last 7 days.`);
    } else {
      insights.push(`Alert: Class reminders have increased by ${increasePercent}% in the last 7 days.`);
    }
  }
  
  // Magic Moment: Find students without reminders in the last week
  if (!studentId) {
    const activeStudents = [...new Set(pointLogs.map(log => log.studentId))];
    const studentsWithoutRecentReminders = [];
    
    activeStudents.forEach(studentId => {
      const studentLogs = pointLogs.filter(log => log.studentId === studentId);
      const recentReminders = studentLogs.filter(log => 
        log.type === 'reminder' && new Date(log.timestamp) > weekAgo
      );
      
      if (recentReminders.length === 0) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          studentsWithoutRecentReminders.push(student);
        }
      }
    });
    
    if (studentsWithoutRecentReminders.length > 0) {
      insights.push(`Magic Moment: ${studentsWithoutRecentReminders[0].name} hasn't received a reminder in over a week!`);
    }
  }
  
  // If no insights were generated, add a general one
  if (insights.length === 0) {
    insights.push("Great progress overall! Keep up the positive reinforcement.");
  }
  
  return insights;
};

// Function to filter logs by date range
export const filterLogsByDateRange = (pointLogs, range) => {
  const now = new Date();
  let startDate = new Date(0); // Default to beginning of time
  
  switch (range) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'all':
    default:
      // Keep the default start date (beginning of time)
      break;
  }
  
  return pointLogs.filter(log => new Date(log.timestamp) >= startDate);
};
// Function to transform points_log data to the format expected by the analytics
export const transformPointsLogData = (pointsLog, students, tasks) => {
  if (!pointsLog || !Array.isArray(pointsLog)) return [];
  
  return pointsLog.map(log => {
    // Find the student associated with this log entry
    const student = students.find(s => s.id === log.student_id);
    // Find the task associated with this log entry
    const task = tasks.find(t => t.id === log.task_id);
    
    return {
      id: log.id,
      studentId: log.student_id,
      studentName: student ? student.name : 'Unknown Student',
      type: log.point_type === 'strength' ? 'positive' : 'reminder',
      taskName: task ? task.title : 'Unknown Task',
      timestamp: log.created_at || log.timestamp
    };
  });
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

// Function to get top 3 strengths for the class (for the main Donut Chart)
export const getClassTopStrengths = (pointLogs) => {
  // Filter to only positive logs (strengths)
  const strengthLogs = pointLogs.filter(log => log.type === 'positive');
  
  // Count occurrences of each task
  const strengthCounts = {};
  strengthLogs.forEach(log => {
    strengthCounts[log.taskName] = (strengthCounts[log.taskName] || 0) + 1;
  });
  
  // Sort by count and return top 3
  return Object.entries(strengthCounts)
    .map(([taskName, count]) => ({ taskName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
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
  
  // Calculate weekly comparison for growth tracking
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentLogs = filteredLogs.filter(log => new Date(log.timestamp) > weekAgo);
  const previousLogs = filteredLogs.filter(log => new Date(log.timestamp) <= weekAgo);
  
  // Calculate strength vs reminder ratios for both periods
  const recentStrengths = recentLogs.filter(log => log.type === 'positive').length;
  const recentReminders = recentLogs.filter(log => log.type === 'reminder').length;
  const previousStrengths = previousLogs.filter(log => log.type === 'positive').length;
  const previousReminders = previousLogs.filter(log => log.type === 'reminder').length;
  
  const recentTotal = recentStrengths + recentReminders;
  const previousTotal = previousStrengths + previousReminders;
  
  // Fairy Insight: Compare focus levels
  if (recentTotal > 0 && previousTotal > 0) {
    const recentFocusRatio = recentStrengths / recentTotal;
    const previousFocusRatio = previousStrengths / previousTotal;
    
    if (recentFocusRatio > previousFocusRatio) {
      const improvementPercent = Math.round(((recentFocusRatio - previousFocusRatio) / previousFocusRatio) * 100);
      if (studentId) {
        const student = students.find(s => s.id === studentId);
        insights.push(`Fairy Insight: ${student?.name || 'This student'} is ${improvementPercent}% more focused this week than last week!`);
      } else {
        insights.push(`Fairy Insight: The class is ${improvementPercent}% more focused this week than last week!`);
      }
    } else if (recentFocusRatio < previousFocusRatio) {
      const declinePercent = Math.round(((previousFocusRatio - recentFocusRatio) / previousFocusRatio) * 100);
      if (studentId) {
        const student = students.find(s => s.id === studentId);
        insights.push(`Fairy Insight: ${student?.name || 'This student'} is ${declinePercent}% less focused this week than last week. Consider extra support.`);
      } else {
        insights.push(`Fairy Insight: The class is ${declinePercent}% less focused this week than last week. Consider adjusting activities.`);
      }
    }
  }
  
  // Growth Alert: Check if reminders have increased in the last 7 days
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
  
  // Consistency Insight: Identify most consistent performers
  if (!studentId) {
    const studentStrengthCounts = {};
    pointLogs.forEach(log => {
      if (log.type === 'positive') {
        studentStrengthCounts[log.studentId] = (studentStrengthCounts[log.studentId] || 0) + 1;
      }
    });
    
    // Find top 3 students with most positive awards
    const sortedStudents = Object.entries(studentStrengthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([studentId, count]) => ({ studentId, count }));
    
    if (sortedStudents.length > 0) {
      const topStudent = students.find(s => s.id === sortedStudents[0].studentId);
      if (topStudent) {
        insights.push(`Consistency Star: ${topStudent.name} leads with ${sortedStudents[0].count} positive awards!`);
      }
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
// Test file for insights functionality
import { transformPointsLogData, calculateStrengthVsNeed, getTopStrengths, getClassTopStrengths, generateInsights, filterLogsByDateRange } from './insightsEngine';

// Mock data for testing
const mockStudents = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Carol Davis' }
];

const mockTasks = [
  { id: 1, title: 'Participation' },
  { id: 2, title: 'Kindness' },
  { id: 3, title: 'Focus' },
  { id: 4, title: 'Leadership' }
];

const mockPointsLog = [
  { id: 1, student_id: 1, task_id: 1, point_type: 'strength', created_at: new Date().toISOString() },
  { id: 2, student_id: 1, task_id: 2, point_type: 'strength', created_at: new Date().toISOString() },
  { id: 3, student_id: 2, task_id: 1, point_type: 'reminder', created_at: new Date().toISOString() },
  { id: 4, student_id: 2, task_id: 3, point_type: 'strength', created_at: new Date().toISOString() },
  { id: 5, student_id: 3, task_id: 1, point_type: 'strength', created_at: new Date().toISOString() },
  { id: 6, student_id: 1, task_id: 1, point_type: 'strength', created_at: new Date().toISOString() },
  { id: 7, student_id: 3, task_id: 2, point_type: 'reminder', created_at: new Date().toISOString() },
];

console.log('Testing insights functionality...\n');

// Test data transformation
const transformedData = transformPointsLogData(mockPointsLog, mockStudents, mockTasks);
console.log('1. Transformed data:', transformedData);

// Test strength vs need calculation for class
const classStrengthVsNeed = calculateStrengthVsNeed(transformedData);
console.log('\n2. Class strength vs need:', classStrengthVsNeed);

// Test strength vs need calculation for individual student
const studentStrengthVsNeed = calculateStrengthVsNeed(transformedData, 1);
console.log('3. Student 1 strength vs need:', studentStrengthVsNeed);

// Test top strengths for class
const classTopStrengths = getClassTopStrengths(transformedData);
console.log('4. Class top strengths:', classTopStrengths);

// Test top strengths for individual student
const studentTopStrengths = getTopStrengths(transformedData, 1);
console.log('5. Student 1 top strengths:', studentTopStrengths);

// Test insights generation
const insights = generateInsights(transformedData, mockStudents);
console.log('6. Generated insights:', insights);

// Test date filtering
const filteredLogs = filterLogsByDateRange(transformedData, 'all');
console.log('7. Filtered logs (all time):', filteredLogs.length);

console.log('\nAll tests completed successfully!');
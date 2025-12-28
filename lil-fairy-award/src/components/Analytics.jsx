import React, { useState, useEffect } from 'react';
import { useClassContext } from '../contexts/ClassContext';
import DonutChart from './DonutChart';
import StudentReportCard from './StudentReportCard';
import { transformPointsLogData, calculateStrengthVsNeed, getTopStrengths, getClassTopStrengths, generateInsights, filterLogsByDateRange } from '../utils/insightsEngine';
import supabaseService from '../services/supabaseService';

const Analytics = () => {
  const { students, loading, selectedClass } = useClassContext();
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // 'week', 'month', 'all'
  const [pointLogs, setPointLogs] = useState([]);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'student-report'
  const [tasks, setTasks] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Fetch real point logs and tasks when selected class changes
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (selectedClass) {
        setLogsLoading(true);
        
        // Fetch point logs for the class
        const { data: pointsLogData, error: pointsError } = await supabaseService.db.getPointLog(selectedClass.id);
        
        if (pointsError) {
          console.error('Error fetching point logs:', pointsError);
          setPointLogs([]);
          setLogsLoading(false);
          return;
        }
        
        // Fetch tasks for the class to get task names
        const { data: tasksData, error: tasksError } = await supabaseService.db.getTasks(selectedClass.id);
        
        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          setTasks([]);
        } else {
          setTasks(tasksData || []);
        }
        
        // Transform the data to the format expected by analytics
        const transformedData = transformPointsLogData(pointsLogData || [], students, tasksData || []);
        setPointLogs(transformedData);
        setLogsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedClass, students]);

  // Filter logs based on date range
  const filteredLogs = filterLogsByDateRange(pointLogs, dateRange);

  // Calculate overall class metrics
  const { strengthPercent, needPercent } = calculateStrengthVsNeed(filteredLogs);
  const topStrengths = getClassTopStrengths(filteredLogs);
  const insights = generateInsights(filteredLogs, students);

  // Get selected student object if a specific student is selected
  const selectedStudentObj = selectedStudent !== 'all' 
    ? students.find(s => s.id.toString() === selectedStudent) 
    : null;

  // Chart data for class overview
  const classChartData = [
    { name: 'Strengths', value: strengthPercent, color: '#6B46FF' },
    { name: 'Needs', value: needPercent, color: '#FF6B6B' }
  ];

  if (loading || logsLoading) {
    return <div className="analytics glass">Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <h1>Analytics & Insights</h1>
      
      {/* Filter Bar */}
      <div className="filters glass">
        <div className="filter-group">
          <label>Student:</label>
          <select 
            value={selectedStudent} 
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              setActiveView(e.target.value === 'all' ? 'overview' : 'student-report');
            }}
          >
            <option value="all">All Students</option>
            {students.map(student => (
              <option key={student.id} value={student.id.toString()}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>View:</label>
          <select 
            value={activeView} 
            onChange={(e) => setActiveView(e.target.value)}
            disabled={selectedStudent === 'all'}
          >
            <option value="overview">Overview</option>
            <option value="student-report">Student Report</option>
          </select>
        </div>
      </div>

      {activeView === 'overview' && (
        <div className="analytics-grid">
          {/* Class Overview Chart */}
          <div className="chart-container glass">
            <h2>Class Strengths vs Needs Distribution</h2>
            <DonutChart 
              data={classChartData} 
              centerText={{ value: `${strengthPercent}%`, label: 'Strengths' }}
              size={200}
            />
          </div>

          {/* Top Strengths */}
          <div className="top-strengths glass">
            <h2>Top Class Strengths</h2>
            <div className="strengths-list">
              {topStrengths.length > 0 ? (
                topStrengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <span className="strength-rank">#{index + 1}</span>
                    <span className="strength-name">{strength.taskName}</span>
                    <span className="strength-count">({strength.count} times)</span>
                  </div>
                ))
              ) : (
                <p>No strength data available</p>
              )}
            </div>
          </div>

          {/* Smart Insights */}
          <div className="insights-container glass">
            <h2>Smart Insights</h2>
            <div className="insights-list">
              {insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <span className="insight-icon">💡</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Performance */}
          <div className="student-performance glass">
            <h2>Student Performance Overview</h2>
            <div className="student-performance-grid">
              {students.map(student => {
                const { strengthPercent: studentStrength, needPercent: studentNeed } = 
                  calculateStrengthVsNeed(filteredLogs, student.id);
                
                return (
                  <div key={student.id} className="student-performance-card">
                    <div className="student-avatar-small">{student.avatar_url}</div>
                    <div className="student-name">{student.name}</div>
                    <div className="student-stats">
                      <div className="stat">
                        <span className="stat-label">Strengths:</span>
                        <span className="stat-value purple">{studentStrength}%</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Needs:</span>
                        <span className="stat-value red">{studentNeed}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'student-report' && selectedStudentObj && (
        <div className="student-report-container">
          <StudentReportCard 
            student={selectedStudentObj} 
            pointLogs={filteredLogs} 
            students={students}
            dateRange={dateRange}
          />
        </div>
      )}
    </div>
  );
};

export default Analytics;
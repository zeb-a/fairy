import React, { useState } from 'react';

const Analytics = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');

  // Mock data for charts
  const strengthVsNeedData = [
    { type: 'Strengths', value: 75, color: '#6B46FF' },
    { type: 'Needs', value: 25, color: '#FF6B6B' }
  ];

  const insights = [
    "Emma Johnson has improved their 'Focus' awards by 20% this week!",
    "Class A is showing increased participation in class activities.",
    "Students are responding well to the positive reinforcement system.",
    "Need-based interventions are showing improvement in target areas."
  ];

  return (
    <div className="analytics">
      <h1>Analytics & Insights</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label>Class:</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="all">All Classes</option>
            <option value="class-a">Class A</option>
            <option value="class-b">Class B</option>
            <option value="class-c">Class C</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Student:</label>
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
            <option value="all">All Students</option>
            <option value="emma">Emma Johnson</option>
            <option value="michael">Michael Chen</option>
            <option value="sophia">Sophia Williams</option>
            <option value="james">James Wilson</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-container">
          <h2>Strengths vs Needs Distribution</h2>
          <div className="donut-chart">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {strengthVsNeedData.map((segment, index) => {
                const radius = 80;
                const circumference = 2 * Math.PI * radius;
                const startAngle = index === 0 ? -90 : -90 + (strengthVsNeedData[0].value / 100) * 360;
                const angle = segment.value / 100 * 360;
                const endAngle = startAngle + angle;
                
                const x1 = 100 + radius * Math.cos(startAngle * Math.PI / 180);
                const y1 = 100 + radius * Math.sin(startAngle * Math.PI / 180);
                const x2 = 100 + radius * Math.cos(endAngle * Math.PI / 180);
                const y2 = 100 + radius * Math.sin(endAngle * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `L 100 100`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                );
              })}
              <circle cx="100" cy="100" r="40" fill="white" />
              <text x="100" y="95" textAnchor="middle" fontSize="16" fontWeight="bold">75%</text>
              <text x="100" y="115" textAnchor="middle" fontSize="12">Strengths</text>
            </svg>
          </div>
          <div className="chart-legend">
            {strengthVsNeedData.map((item, index) => (
              <div key={index} className="legend-item">
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                ></span>
                <span>{item.type}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insights-container">
          <h2>Smart Insights</h2>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <span className="insight-icon">💡</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-container">
          <h2>Reports</h2>
          <div className="report-actions">
            <button className="report-btn">
              <span className="btn-icon">📄</span>
              Generate PDF Report
            </button>
            <button className="report-btn">
              <span className="btn-icon">📊</span>
              Export Data
            </button>
          </div>
          <div className="report-preview">
            <h3>Sample Report Card</h3>
            <p>Student: Emma Johnson</p>
            <p>Period: This Week</p>
            <p>Strengths: 15</p>
            <p>Needs: 3</p>
            <p>Improvement Areas: Focus, Participation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
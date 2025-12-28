import React, { useRef } from 'react';
import DonutChart from './DonutChart';
import { calculateStrengthVsNeed, getTopStrengths, generateInsights } from '../utils/insightsEngine';

const StudentReportCard = ({ student, pointLogs, students, dateRange }) => {
  const reportRef = useRef();

  // Calculate data for this student
  const { strengthPercent, needPercent } = calculateStrengthVsNeed(pointLogs, student.id);
  const topStrengths = getTopStrengths(pointLogs, student.id);
  const insights = generateInsights(pointLogs, students, student.id);

  const chartData = [
    { name: 'Strengths', value: strengthPercent, color: '#6B46FF' },
    { name: 'Needs', value: needPercent, color: '#FF6B6B' }
  ];

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Report Card - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-card { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .student-info { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
            .student-avatar { font-size: 48px; margin-right: 15px; }
            .student-details h2 { margin: 0; }
            .chart-container { text-align: center; margin: 20px 0; }
            .section { margin: 15px 0; }
            .section h3 { color: #6B46FF; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .strength-item { margin: 5px 0; }
            .insight-item { margin: 5px 0; padding: 5px; background-color: #f9f9f9; border-left: 3px solid #6B46FF; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header">
              <h1>Student Progress Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="student-info">
              <div class="student-avatar">${student.avatar_url}</div>
              <div class="student-details">
                <h2>${student.name}</h2>
                <p>Date Range: ${dateRange}</p>
              </div>
            </div>
            
            <div class="chart-container">
              <h3>Strengths vs Needs Distribution</h3>
              ${/* Simple text representation of the chart for print */ ''}
              <p>Strengths: ${strengthPercent}% | Needs: ${needPercent}%</p>
            </div>
            
            <div class="section">
              <h3>Top Strengths</h3>
              ${topStrengths.map(strength => 
                `<div class="strength-item">• ${strength.taskName} (${strength.count} times)</div>`
              ).join('')}
            </div>
            
            <div class="section">
              <h3>Automated Insights</h3>
              ${insights.map(insight => 
                `<div class="insight-item">• ${insight}</div>`
              ).join('')}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="student-report-card" ref={reportRef}>
      <div className="card-header">
        <div className="student-info">
          <div className="student-avatar">{student.avatar_url}</div>
          <div className="student-details">
            <h2>{student.name}</h2>
            <p>Date Range: {dateRange}</p>
          </div>
        </div>
        <button className="print-btn" onClick={handlePrint}>
          <span className="btn-icon">🖨️</span>
          Print Report
        </button>
      </div>
      
      <div className="report-content">
        <div className="chart-section">
          <h3>Strengths vs Needs Distribution</h3>
          <DonutChart 
            data={chartData} 
            centerText={{ value: `${strengthPercent}%`, label: 'Strengths' }}
            size={180}
          />
        </div>
        
        <div className="strengths-section">
          <h3>Top Strengths</h3>
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
              <p>No strengths data available</p>
            )}
          </div>
        </div>
        
        <div className="insights-section">
          <h3>Automated Insights</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-icon">💡</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportCard;
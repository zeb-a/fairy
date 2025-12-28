import React from 'react';

const DonutChart = ({ data, centerText, size = 200 }) => {
  const radius = 80;
  const centerRadius = 40; // Inner radius for donut hole
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  let startAngle = -90; // Start from top

  return (
    <div className="donut-chart-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        
        {/* Data segments */}
        {data.map((segment, index) => {
          const segmentLength = (segment.value / 100) * circumference;
          const largeArcFlag = segment.value > 50 ? 1 : 0;
          
          // Calculate start and end angles
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = ((startAngle + (segment.value / 100) * 360) * Math.PI) / 180;
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${centerX} ${centerY}`
          ].join(' ');
          
          startAngle += (segment.value / 100) * 360; // Update start angle for next segment
          
          return (
            <path
              key={index}
              d={pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Center circle to create donut effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r={centerRadius}
          fill="white"
        />
        
        {/* Center text */}
        {centerText && (
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#374151"
          >
            {centerText.value}
          </text>
        )}
        {centerText && centerText.label && (
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            {centerText.label}
          </text>
        )}
      </svg>
      
      {/* Legend */}
      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: item.color }}
            ></span>
            <span>{item.name}: {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
import React from 'react';
import { useActivityContext } from './LiveSnapshot';

const LiveSnapshotFeed = ({ maxItems = 10 }) => {
  const { activities } = useActivityContext();

  return (
    <div className="live-snapshot glass">
      <h3>Live Snapshot</h3>
      <div className="activity-list">
        {activities.slice(0, maxItems).map(activity => (
          <div key={activity.id} className={`activity-item ${activity.type}`}>
            <div className="activity-content">
              <span className="activity-student">{activity.studentName}</span>
              <span className="activity-action">{activity.action}</span>
            </div>
            <span className="activity-time">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveSnapshotFeed;
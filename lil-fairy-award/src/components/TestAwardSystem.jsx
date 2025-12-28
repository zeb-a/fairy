import React from 'react';
import { ActivityProvider } from './LiveSnapshot';
import AwardSystem from './AwardSystem';

const TestAwardSystem = () => {
  return (
    <ActivityProvider>
      <AwardSystem />
    </ActivityProvider>
  );
};

export default TestAwardSystem;
'use client';

import React from 'react';
import { useFormContext } from './FormContext';
import { TABS } from './types';

export const ProgressBar: React.FC = () => {
  const { currentTab, agentType } = useFormContext();

  return (
    <div className="w-full bg-muted rounded-full h-2 mb-6">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          agentType === 'leftcurve' ? 'bg-yellow-500' : 'bg-purple-500'
        }`}
        style={{
          width: `${((TABS.indexOf(currentTab) + 1) / TABS.length) * 100}%`,
        }}
      />
    </div>
  );
};

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { useFormContext } from '../FormContext';
import { getPlaceholder } from '../types';

export const TradingBehavior: React.FC = () => {
  const { formData, agentType, updateField } = useFormContext();

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Trading Behavior</Label>
      <p className="text-sm text-muted-foreground">
        Describe how your agent should approach trading decisions. This will be
        used to guide its behavior.
      </p>
      <textarea
        className={`min-h-[120px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:ring-2 ring-offset-2 ${
          agentType === 'leftcurve'
            ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
            : 'focus:border-purple-500 focus:ring-purple-500/20'
        }`}
        value={formData.tradingBehavior}
        onChange={(e) => updateField('tradingBehavior', e.target.value)}
        placeholder={getPlaceholder('tradingBehavior', agentType)}
      />
      <div className="pt-2">
        <p className="text-xs text-muted-foreground">
          Include details such as:
        </p>
        <ul className="text-xs text-muted-foreground list-disc list-inside pt-1 space-y-1">
          <li>Risk tolerance (high/medium/low)</li>
          <li>Preferred assets or market conditions</li>
          <li>Hold duration (short/medium/long term)</li>
          <li>Entry/exit strategies</li>
          <li>Position sizing preferences</li>
        </ul>
      </div>
    </div>
  );
};

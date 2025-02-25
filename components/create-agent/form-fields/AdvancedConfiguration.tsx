'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFormContext } from '../FormContext';
import { ArrayField } from './ArrayField';
import { getPlaceholder } from '../types';

export const AdvancedConfiguration: React.FC = () => {
  const { agentType, showAdvancedConfig, setShowAdvancedConfig } =
    useFormContext();

  return (
    <div className="space-y-6 mt-4">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
        className="w-full justify-between border py-5 px-4 text-base font-medium rounded-lg hover:bg-muted/50"
      >
        <span
          className={
            agentType === 'leftcurve' ? 'text-yellow-600' : 'text-purple-600'
          }
        >
          Advanced Configuration
        </span>
        {showAdvancedConfig ? (
          <ChevronUp
            className={`h-5 w-5 ${
              agentType === 'leftcurve' ? 'text-yellow-500' : 'text-purple-500'
            }`}
          />
        ) : (
          <ChevronDown
            className={`h-5 w-5 ${
              agentType === 'leftcurve' ? 'text-yellow-500' : 'text-purple-500'
            }`}
          />
        )}
      </Button>

      {showAdvancedConfig && (
        <div className="space-y-6 border-l-2 pl-4 pt-2 animate-in fade-in slide-in-from-top-5">
          <ArrayField
            field="objectives"
            label="Objectives"
            placeholder={getPlaceholder('objectives', agentType)}
            description="Define what your agent aims to achieve (e.g., find arbitrage opportunities, execute swing trades)"
          />

          <ArrayField
            field="knowledge"
            label="Knowledge"
            placeholder={getPlaceholder('knowledge', agentType)}
            description="Areas of expertise your agent has (e.g., technical analysis, fundamental analysis)"
          />

          <ArrayField
            field="lore"
            label="Lore"
            placeholder={getPlaceholder('lore', agentType)}
            description="Background story and personality traits of your agent"
          />
        </div>
      )}
    </div>
  );
};

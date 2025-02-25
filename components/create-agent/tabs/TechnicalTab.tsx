'use client';

import React from 'react';
import { PluginSelector } from '../form-fields/PluginSelector';
import { IntervalSelector } from '../form-fields/IntervalSelector';
import { Card } from '@/components/ui/card';

export const TechnicalTab: React.FC = () => {
  return (
    <div className="space-y-6 mt-4">
      <Card className="p-6 border-2">
        <IntervalSelector />
      </Card>

      <Card className="p-6 border-2">
        <PluginSelector />
      </Card>

      <div className="space-y-2 mt-6">
        <h3 className="text-lg font-medium">Technical Information</h3>
        <p className="text-sm text-muted-foreground">
          Your agent will run autonomously based on the time interval you set
          above. The plugins you selected determine what capabilities your agent
          has when interacting with the blockchain.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Note:</strong> This agent is fully autonomous but will follow
          the trading behavior and objectives you defined in the previous tab.
        </p>
      </div>
    </div>
  );
};

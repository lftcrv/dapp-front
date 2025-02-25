'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useFormContext } from './FormContext';
import { TabsNavigation } from './TabsNavigation';

interface AgentFormProps {
  isSubmitting: boolean;
  onDeploy: (e: React.FormEvent) => Promise<void>;
}

export const AgentForm: React.FC<AgentFormProps> = ({
  isSubmitting,
  onDeploy,
}) => {
  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="pt-6">
        <form>
          <TabsNavigation isSubmitting={isSubmitting} onDeploy={onDeploy} />
        </form>
      </CardContent>
    </Card>
  );
};

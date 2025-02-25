'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, Loader2 } from 'lucide-react';
import { useFormContext } from './FormContext';
import { ProfileTab } from './tabs/ProfileTab';
import { TechnicalTab } from './tabs/TechnicalTab';
import { TabType } from './types';

interface TabsNavigationProps {
  isSubmitting: boolean;
  onDeploy: (e: React.FormEvent) => Promise<void>;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  isSubmitting,
  onDeploy,
}) => {
  const {
    currentTab,
    setCurrentTab,
    agentType,
    handleNext,
    handlePrevious,
    isFormValid,
  } = useFormContext();

  const tabs = [
    { id: 'profile' as TabType, icon: Brain, label: 'Agent Profile' },
    { id: 'technical' as TabType, icon: Settings, label: 'Technical Setup' },
  ];

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => setCurrentTab(value as TabType)}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 mb-6">
        {tabs.map(({ id, icon: Icon, label }) => (
          <TabsTrigger
            key={id}
            value={id}
            className={`transition-all duration-200 ${
              currentTab === id
                ? `${
                    agentType === 'leftcurve'
                      ? 'data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-700'
                      : 'data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700'
                  }`
                : 'hover:bg-muted'
            }`}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="technical">
        <TechnicalTab />
      </TabsContent>

      <div className="flex gap-4 pt-6">
        {currentTab !== 'profile' && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        )}

        {currentTab !== 'technical' ? (
          <Button
            type="button"
            onClick={handleNext}
            className={`flex-1 ${
              agentType === 'leftcurve'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            Next
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className={`w-full font-bold ${
              agentType === 'leftcurve'
                ? 'bg-gradient-to-r from-yellow-500 to-red-500 hover:opacity-90'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90'
            }`}
            disabled={isSubmitting || !isFormValid}
            onClick={onDeploy}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                DEPLOYING...
              </>
            ) : (
              <>
                <Flame className="mr-2 h-5 w-5" />
                DEPLOY {agentType === 'leftcurve' ? '🦧' : '🐙'} AGENT
              </>
            )}
          </Button>
        )}
      </div>
    </Tabs>
  );
};

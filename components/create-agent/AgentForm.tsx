'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Loader2 } from 'lucide-react';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { ArrayField } from './form-fields/ArrayField';
import { PluginSelector } from './form-fields/PluginSelector';
import { IntervalSelector } from './form-fields/IntervalSelector';
import { TradingBehavior } from './form-fields/TradingBehavior';
import { useFormContext } from './FormContext';
import { getPlaceholder } from './types';

interface AgentFormProps {
  isSubmitting: boolean;
  onDeploy: (e: React.FormEvent) => Promise<void>;
}

export const AgentForm: React.FC<AgentFormProps> = ({
  isSubmitting,
  onDeploy,
}) => {
  const { formData, agentType, updateField, isFormValid } = useFormContext();

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="pt-6 space-y-6">
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                Agent Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={getPlaceholder('name', agentType)}
                required
                className={`border-2 transition-all duration-200 ${
                  agentType === 'leftcurve'
                    ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                    : 'focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
            </div>

            <ProfilePictureUpload
              onFileSelect={(file) => {}}
              agentType={agentType}
            />

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-medium">
                Agent Bio
              </Label>
              <textarea
                id="bio"
                className={`min-h-[100px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:ring-2 ring-offset-2 ${
                  agentType === 'leftcurve'
                    ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                    : 'focus:border-purple-500 focus:ring-purple-500/20'
                }`}
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder={getPlaceholder('bio', agentType)}
                required
              />
            </div>
          </div>

          {/* Trading Behavior */}
          <TradingBehavior />

          {/* Objectives */}
          <ArrayField
            field="objectives"
            label="Objectives"
            placeholder={getPlaceholder('objectives', agentType)}
            description="Define what your agent aims to achieve (e.g., find arbitrage opportunities, execute swing trades, etc.)"
          />

          {/* Knowledge */}
          <ArrayField
            field="knowledge"
            label="Knowledge"
            placeholder={getPlaceholder('knowledge', agentType)}
            description="Areas of expertise your agent has (e.g., technical analysis, fundamental analysis, etc.)"
          />

          {/* Lore */}
          <ArrayField
            field="lore"
            label="Lore"
            placeholder={getPlaceholder('lore', agentType)}
            description="Background story and personality traits of your agent"
          />

          {/* Plugins */}
          <PluginSelector />

          {/* Interval */}
          <IntervalSelector />

          {/* Submit Button */}
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
        </form>
      </CardContent>
    </Card>
  );
};

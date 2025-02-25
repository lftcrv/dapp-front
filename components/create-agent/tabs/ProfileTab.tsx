'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { useFormContext } from '../FormContext';
import { getPlaceholder } from '../types';
import { TradingBehavior } from '../form-fields/TradingBehavior';
import { AdvancedConfiguration } from '../form-fields/AdvancedConfiguration';

export const ProfileTab: React.FC = () => {
  const { formData, agentType, updateField, setProfilePicture } =
    useFormContext();

  return (
    <div className="space-y-6 mt-4">
      {/* Agent Name */}
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

      {/* Profile Picture */}
      <ProfilePictureUpload
        onFileSelect={setProfilePicture}
        agentType={agentType}
      />

      {/* Agent Bio */}
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

      {/* Trading Behavior */}
      <TradingBehavior />

      {/* Advanced Configuration (collapsible) */}
      <AdvancedConfiguration />
    </div>
  );
};

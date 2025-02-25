'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { ArrayField } from '../form-fields/ArrayField';
import { useFormContext } from '../FormContext';
import { getPlaceholder } from '../types';

export const BasicInfoTab: React.FC = () => {
  const { formData, agentType, setFormName, setProfilePicture } =
    useFormContext();

  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium">
          Agent Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormName(e.target.value)}
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
        onFileSelect={setProfilePicture}
        agentType={agentType}
      />

      <ArrayField
        field="topics"
        label="Topics"
        placeholder={getPlaceholder('topics', agentType)}
      />

      <ArrayField
        field="adjectives"
        label="Adjectives"
        placeholder={getPlaceholder('adjectives', agentType)}
      />
    </div>
  );
};

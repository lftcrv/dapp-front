'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { ArrayField } from '../form-fields/ArrayField';
import { useFormContext } from '../FormContext';
import { getPlaceholder } from '../types';

export const PersonalityTab: React.FC = () => {
  const {
    formData,
    agentType,
    handleArrayInput,
    handleRemoveField,
    handleAddField,
  } = useFormContext();

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Bio</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddField('bio')}
            className={`${
              agentType === 'leftcurve'
                ? 'hover:bg-yellow-500/20'
                : 'hover:bg-purple-500/20'
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Bio Entry
          </Button>
        </div>
        {formData.bio.map((item, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              className={`min-h-[80px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:ring-2 ring-offset-2 ${
                agentType === 'leftcurve'
                  ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                  : 'focus:border-purple-500 focus:ring-purple-500/20'
              }`}
              value={item}
              onChange={(e) => handleArrayInput('bio', index, e.target.value)}
              placeholder={getPlaceholder('bio', agentType)}
            />
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveField('bio', index)}
                className="hover:bg-red-500/20 self-start"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <ArrayField
        field="lore"
        label="Lore"
        placeholder={getPlaceholder('lore', agentType)}
      />

      <ArrayField
        field="knowledge"
        label="Knowledge"
        placeholder={getPlaceholder('knowledge', agentType)}
      />
    </div>
  );
};

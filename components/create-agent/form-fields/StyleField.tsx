'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useFormContext } from '../FormContext';
import { StyleType } from '../types';

interface StyleFieldProps {
  type: StyleType;
  label: string;
  placeholder: string;
}

export const StyleField: React.FC<StyleFieldProps> = ({
  type,
  label,
  placeholder,
}) => {
  const {
    formData,
    agentType,
    handleStyleInput,
    handleAddStyleField,
    handleRemoveStyleField,
  } = useFormContext();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddStyleField(type)}
          className={`${
            agentType === 'leftcurve'
              ? 'hover:bg-yellow-500/20'
              : 'hover:bg-purple-500/20'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add {label}
        </Button>
      </div>
      {formData.style[type].map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => handleStyleInput(type, index, e.target.value)}
            placeholder={placeholder}
            className="border-2 focus:ring-2 ring-offset-2"
          />
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveStyleField(type, index)}
              className="hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

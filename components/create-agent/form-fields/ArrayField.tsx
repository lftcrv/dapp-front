'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useFormContext } from '../FormContext';
import { ArrayFormField } from '../types';

interface ArrayFieldProps {
  field: ArrayFormField;
  label: string;
  placeholder: string;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  field,
  label,
  placeholder,
}) => {
  const {
    formData,
    agentType,
    handleArrayInput,
    handleRemoveField,
    handleAddField,
  } = useFormContext();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddField(field)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add {label}
        </Button>
      </div>
      <div className="space-y-3">
        {formData[field].map((value: string, index: number) => (
          <div key={index} className="flex gap-2 group">
            <Input
              value={value}
              onChange={(e) => handleArrayInput(field, index, e.target.value)}
              placeholder={placeholder}
              className={`border-2 transition-all duration-200 ${
                agentType === 'leftcurve'
                  ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                  : 'focus:border-purple-500 focus:ring-purple-500/20'
              }`}
            />
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveField(field, index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

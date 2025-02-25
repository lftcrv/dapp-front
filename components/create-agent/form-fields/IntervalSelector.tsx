'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from '../FormContext';

export const IntervalSelector: React.FC = () => {
  const { formData, updateField } = useFormContext();

  const intervals = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 180, label: '3 hours' },
    { value: 360, label: '6 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours' },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="interval" className="text-base font-medium">
        Check Interval
      </Label>
      <p className="text-sm text-muted-foreground">
        How often should your agent check for trading opportunities?
      </p>
      <Select
        value={formData.interval.toString()}
        onValueChange={(value) => updateField('interval', parseInt(value))}
      >
        <SelectTrigger className="w-full" id="interval">
          <SelectValue placeholder="Select interval" />
        </SelectTrigger>
        <SelectContent>
          {intervals.map((interval) => (
            <SelectItem key={interval.value} value={interval.value.toString()}>
              {interval.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useFormContext } from '../FormContext';

export const MessageExampleField: React.FC = () => {
  const {
    formData,
    agentType,
    handleMessageExample,
    handleAddMessageExample,
    handleRemoveMessageExample,
  } = useFormContext();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Message Examples</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMessageExample}
          className={`${
            agentType === 'leftcurve'
              ? 'hover:bg-yellow-500/20'
              : 'hover:bg-purple-500/20'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add Example
        </Button>
      </div>
      {formData.messageExamples.map((example, index) => (
        <Card
          key={index}
          className={`p-4 relative border-2 transition-all duration-200 group ${
            agentType === 'leftcurve'
              ? 'hover:border-yellow-500/50'
              : 'hover:border-purple-500/50'
          }`}
        >
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMessageExample(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-700 absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="space-y-3">
            <textarea
              className={`min-h-[60px] w-full rounded-md border-2 bg-background px-3 py-2 text-sm transition-all duration-200 ${
                agentType === 'leftcurve'
                  ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                  : 'focus:border-purple-500 focus:ring-purple-500/20'
              }`}
              value={example[0].content.text}
              onChange={(e) =>
                handleMessageExample(index, 'user', e.target.value)
              }
              placeholder={
                agentType === 'leftcurve'
                  ? 'wen moon ser?'
                  : "What's your analysis of current market conditions?"
              }
            />
            <textarea
              className={`min-h-[60px] w-full rounded-md border-2 bg-background px-3 py-2 text-sm transition-all duration-200 ${
                agentType === 'leftcurve'
                  ? 'focus:border-yellow-500 focus:ring-yellow-500/20'
                  : 'focus:border-purple-500 focus:ring-purple-500/20'
              }`}
              value={example[1].content.text}
              onChange={(e) =>
                handleMessageExample(index, 'agent', e.target.value)
              }
              placeholder={
                agentType === 'leftcurve'
                  ? 'ngmi if you have to ask anon 🚀'
                  : 'Based on order flow analysis and market structure...'
              }
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

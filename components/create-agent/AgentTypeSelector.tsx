'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFormContext } from './FormContext';

export const AgentTypeSelector: React.FC = () => {
  const { agentType, setAgentType } = useFormContext();

  return (
    <div className="text-center space-y-4">
      <h1
        className={`font-sketch text-4xl bg-gradient-to-r ${
          agentType === 'leftcurve'
            ? 'from-yellow-500 via-orange-500 to-red-500'
            : 'from-purple-500 via-indigo-500 to-blue-500'
        } text-transparent bg-clip-text`}
      >
        Deploy Your Agent
      </h1>
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">
          choose your side anon, there&apos;s no going back 🔥
        </p>
        <div className="flex items-center gap-4">
          <Button
            variant={agentType === 'leftcurve' ? 'default' : 'outline'}
            onClick={() => setAgentType('leftcurve')}
            className={
              agentType === 'leftcurve'
                ? 'bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105 transition-all'
                : ''
            }
          >
            <span className="mr-2">🦧</span> LeftCurve
          </Button>
          <Button
            variant={agentType === 'rightcurve' ? 'default' : 'outline'}
            onClick={() => setAgentType('rightcurve')}
            className={
              agentType === 'rightcurve'
                ? 'bg-purple-500 hover:bg-purple-600 transform hover:scale-105 transition-all'
                : ''
            }
          >
            <span className="mr-2">🐙</span> RightCurve
          </Button>
        </div>
        <motion.div
          className="space-y-1"
          initial={false}
          animate={{ x: agentType === 'leftcurve' ? 0 : 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <p className="text-muted-foreground text-sm">
            {agentType === 'leftcurve'
              ? 'Creative chaos, meme magic, and pure degen energy'
              : 'Technical mastery, market wisdom, and calculated alpha'}
          </p>
          <p className="text-[13px] text-muted-foreground italic">
            {agentType === 'leftcurve'
              ? 'For those who believe fundamentals are just vibes'
              : 'For those who see patterns in the matrix'}
          </p>
        </motion.div>
        <p className="text-[12px] text-yellow-500/70 animate-pulse">
          Midcurvers ngmi 😭
        </p>
      </div>
    </div>
  );
};

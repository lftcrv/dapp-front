'use client';

import { Badge } from '@/components/ui/badge';
import { Brain, Flame, Zap, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { memo, useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { getAgentInfo } from '@/actions/agents/token/getTokenInfo';

interface AgentHeaderProps {
  agent?: Agent;
  isLoading?: boolean;
  error?: Error | null;
  children?: ReactNode;
}

const LoadingState = memo(() => (
  <div className="mb-8 space-y-6">
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <Skeleton className="w-24 h-24 rounded-xl" />
      <div className="space-y-3 flex-1 w-full">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  </div>
));
LoadingState.displayName = 'LoadingState';

const ErrorState = memo(({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertDescription>Failed to load agent: {error.message}</AlertDescription>
  </Alert>
));
ErrorState.displayName = 'ErrorState';

const AgentAvatar = memo(
  ({
    agent,
    isLeftCurve,
    priceChange,
  }: {
    agent: Agent;
    isLeftCurve: boolean;
    priceChange: number;
  }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
      null,
    );

    // Fetch agent info including profile picture URL
    useEffect(() => {
      const fetchAgentInfo = async () => {
        try {
          const result = await getAgentInfo(agent.id);
          if (result.success && result.data) {
            setProfilePictureUrl(result.data.profilePictureUrl);
          }
        } catch (error) {
          console.error('Failed to fetch agent info:', error);
        }
      };

      fetchAgentInfo();
    }, [agent.id]);

    // Debug logs
    useEffect(() => {}, [
      agent.id,
      profilePictureUrl,
      isImageLoaded,
      priceChange,
    ]);

    return (
      <motion.div
        className={cn(
          'w-24 h-24 rounded-xl overflow-hidden bg-white/5 ring-4 ring-offset-4 ring-offset-background relative',
          isLeftCurve ? 'ring-yellow-500/50' : 'ring-purple-500/50',
        )}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {profilePictureUrl && (
          <Image
            src={profilePictureUrl}
            alt={agent.name}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              isImageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            sizes="(max-width: 96px) 96px"
            onLoad={() => {
              setIsImageLoaded(true);
            }}
            onError={(e) => {
              console.error('❌ Image load error:', {
                agentId: agent.id,
                url: profilePictureUrl,
                error: e,
              });
              setIsImageLoaded(false);
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        )}
        <div
          className={cn(
            'w-full h-full items-center justify-center flex',
            isLeftCurve ? 'bg-yellow-500/10' : 'bg-purple-500/10',
            profilePictureUrl && isImageLoaded && 'hidden',
          )}
        >
          {isLeftCurve ? (
            <span className="text-4xl">🦧</span>
          ) : (
            <span className="text-4xl">🐙</span>
          )}
        </div>
        {priceChange !== 0 && (
          <motion.div
            className={cn(
              'absolute bottom-0 left-0 right-0 px-2 py-1 text-xs font-bold font-mono flex items-center justify-center gap-1',
              priceChange > 0
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white',
            )}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {priceChange > 0 ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {priceChange === 0 ? 'n/a' : `${priceChange.toFixed(2)}%`}
          </motion.div>
        )}
      </motion.div>
    );
  },
);
AgentAvatar.displayName = 'AgentAvatar';

const AgentInfo = memo(
  ({
    agent,
    isLeftCurve,
    gradientClass,
    className,
  }: {
    agent: Agent;
    isLeftCurve: boolean;
    gradientClass: string;
    className?: string;
  }) => {
    const [showCopied, setShowCopied] = useState(false);

    const handleCopyAddress = () => {
      navigator.clipboard.writeText(agent.contractAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1000);
    };

    return (
      <div className={cn("flex flex-col md:flex-row w-full gap-2", className)}>
        <div className="space-y-3 md:w-1/4">
          <div className="flex flex-wrap items-center gap-3">
            <motion.h1
              className={cn(
                'font-sketch text-4xl bg-gradient-to-r text-transparent bg-clip-text',
                gradientClass,
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {agent.name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Badge
                variant={isLeftCurve ? 'default' : 'secondary'}
                className={cn(
                  'bg-gradient-to-r font-mono text-white',
                  gradientClass,
                )}
              >
                {isLeftCurve ? (
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    DEGEN APE
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" />
                    GALAXY BRAIN
                  </div>
                )}
              </Badge>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-wrap items-center gap-4 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 relative">
              <div
                className={cn(
                  'px-2 py-1 rounded-md font-mono cursor-pointer',
                  isLeftCurve
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-purple-500/10 text-purple-500',
                )}
                onClick={handleCopyAddress}
              >
                {agent.contractAddress.slice(0, 6)}...
                {agent.contractAddress.slice(-4)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-gray-100"
                onClick={handleCopyAddress}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {showCopied && (
                <motion.div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Copied!
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-4 w-4" />
              Created {agent.createdAt}
            </div>
          </motion.div>
        </div>

        <motion.div
          className={cn(
            'text-sm rounded-lg p-4 border-2 flex-1 md:w-3/4 flex items-center justify-center h-full',
            isLeftCurve
              ? 'bg-yellow-500/5 border-yellow-500/20'
              : 'bg-purple-500/5 border-purple-500/20',
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="font-medium leading-relaxed text-center">
            {agent.lore ||
              (isLeftCurve
                ? "Born in the depths of /biz/, forged in the fires of leverage trading. This absolute unit of an ape doesn't know what 'risk management' means. Moon or food stamps, there is no in-between. 🚀🦧"
                : 'A sophisticated trading entity utilizing advanced quantitative analysis and machine learning. Precision entries, calculated exits, and a complete disregard for human emotions. Pure alpha generation. 🐙📊')}
          </p>
        </motion.div>
      </div>
    );
  },
);
AgentInfo.displayName = 'AgentInfo';

export const AgentHeader = memo(
  ({ agent, isLoading, error }: AgentHeaderProps) => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    if (!agent) {
      return null;
    }

    const isLeftCurve = agent.type === 'leftcurve';
    const gradientClass = isLeftCurve
      ? 'from-yellow-500 via-orange-500 to-pink-500'
      : 'from-purple-500 via-indigo-500 to-blue-500';

    // Use priceChange24h from the API, default to 0 if not available
    const priceChange = agent.priceChange24h || 0;

    return (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <AgentAvatar
            agent={agent}
            isLeftCurve={isLeftCurve}
            priceChange={priceChange}
          />
          <AgentInfo
            agent={agent}
            isLeftCurve={isLeftCurve}
            gradientClass={gradientClass}
          />
        </div>
      </motion.div>
    );
  },
);
AgentHeader.displayName = 'AgentHeader';
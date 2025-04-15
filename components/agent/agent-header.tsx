'use client';

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {

  GitFork,
  ExternalLink,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/types';
import { cn } from '@/lib/utils';


interface AgentHeaderProps {
  agent: Agent;
  simplified?: boolean;
}

// Simple agent card component similar to the screenshot
const SimpleAgentCard = memo(({ agent }: { agent: Agent }) => {
  const isLeftCurve = agent.type === 'leftcurve';
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

  useEffect(() => {
    // Process the image URL to ensure it's valid
    if (agent.profilePictureUrl) {
      // If it's a full URL, use it directly, otherwise add backend URL
      const fullUrl = agent.profilePictureUrl.startsWith('http') 
        ? agent.profilePictureUrl
        : `${backendUrl}${agent.profilePictureUrl}`;
      setImageUrl(fullUrl);
    }
  }, [agent.profilePictureUrl, backendUrl]);
  
  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div className="flex items-center gap-4 w-full">
          <div className="agent-card-avatar">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="64px"
                priority
                onError={(e) => {
                  console.error('❌ Image Error:', {
                    src: e.currentTarget.src,
                    name: agent.name,
                  });
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-800"><span class="text-2xl">${isLeftCurve ? '🦧' : '🐙'}</span></div>`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-2xl">{isLeftCurve ? '🦧' : '🐙'}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-sketch text-white">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="agent-badge agent-badge-active">
                Active
              </span>
              <span className="agent-badge agent-badge-parent">
                Parent
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="agent-card-content">
        <p>
          {agent.characterConfig?.bio || "No bio available for this agent."}
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
    </div>
  );
});
SimpleAgentCard.displayName = 'SimpleAgentCard';

const AgentHeader = memo(({ agent, simplified = false }: AgentHeaderProps) => {
  const isLeftCurve = agent.type === 'leftcurve';
  // Use priceChange24h from the API, default to 0 if not available
  const priceChange = agent.priceChange24h || 0;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

  useEffect(() => {
    // Process the image URL to ensure it's valid
    if (agent.profilePictureUrl) {
      // If it's a full URL, use it directly, otherwise add backend URL
      const fullUrl = agent.profilePictureUrl.startsWith('http') 
        ? agent.profilePictureUrl
        : `${backendUrl}${agent.profilePictureUrl}`;
      setImageUrl(fullUrl);
    }
  }, [agent.profilePictureUrl, backendUrl]);

  if (simplified) {
    return <SimpleAgentCard agent={agent} />;
  }

  return (
    <div className="relative text-white">
      {/* Background gradient effect */}
      <div
        className={cn(
          'absolute inset-0 opacity-30',
          isLeftCurve
            ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
            : 'bg-gradient-to-r from-purple-500 to-blue-500',
        )}
      />

      {/* Light beams effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute top-0 left-1/4 w-1/2 h-[300px] rotate-45 opacity-20 blur-xl',
            isLeftCurve ? 'bg-orange-500' : 'bg-purple-500',
          )}
        />
        <div
          className={cn(
            'absolute bottom-0 right-1/4 w-1/2 h-[300px] -rotate-45 opacity-20 blur-xl',
            isLeftCurve ? 'bg-yellow-500' : 'bg-blue-500',
          )}
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 p-3">
        {/* Agent Avatar */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-black/50 flex-shrink-0 shadow-xl border border-white/20">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${agent.name} profile picture`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 128px"
              priority
              onError={(e) => {
                console.error('❌ Image Error:', {
                  src: e.currentTarget.src,
                  name: agent.name,
                });
                // Hide the image and show a fallback emoji
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-b ${
                      isLeftCurve 
                        ? 'from-orange-900/70 to-orange-700/50' 
                        : 'from-purple-900/70 to-purple-700/50'
                    }">
                      <span class="text-4xl">${isLeftCurve ? '🦧' : '🐙'}</span>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center bg-gradient-to-b",
              isLeftCurve 
                ? 'from-orange-900/70 to-orange-700/50' 
                : 'from-purple-900/70 to-purple-700/50'
            )}>
              <span className="text-4xl">
                {isLeftCurve ? '🦧' : '🐙'}
              </span>
            </div>
          )}

          {priceChange !== 0 && (
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 px-2 py-1 text-xs font-bold font-mono flex items-center justify-center gap-1',
                priceChange > 0
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/90 text-white',
              )}
            >
              {priceChange > 0 ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {Math.abs(priceChange).toFixed(2)}%
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <motion.h1
                className="text-3xl font-sketch flex items-center flex-wrap gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {agent.name}
                <span
                  className={cn(
                    'text-lg font-patrick',
                    isLeftCurve ? 'text-orange-400' : 'text-purple-400',
                  )}
                >
                  ${agent.symbol}
                </span>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                    isLeftCurve
                      ? 'bg-orange-500/30 text-orange-200'
                      : 'bg-purple-500/30 text-purple-200',
                  )}
                >
                  {isLeftCurve ? '🦧 DEGEN' : '🐙 SIGMA'}
                </span>
              </motion.h1>

              <div className="flex items-center gap-2 text-white/60 text-sm mt-1 font-patrick">
                <span>#{agent.id}</span>
                <span className="text-xs">•</span>
                <span>{agent.holders.toLocaleString()} holders</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5"
                onClick={() => window.open(`https://starkscan.co/contract/${agent.contractAddress}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-patrick">View on Starkscans</span>
              </Button>

              <Button
                size="sm"
                className={cn(
                  'flex items-center gap-1.5 text-white',
                  isLeftCurve
                    ? 'bg-gradient-to-r hover:from-orange-600 hover:to-yellow-600'
                    : 'hover:bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600',
                )}
              >
                <GitFork className="w-4 h-4" />
                <span className="font-patrick">Forksss Agent</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span className="font-patrick">Download Trades</span>
              </Button>
            </div>
          </div>

          <p className="text-white/80 text-sm mt-4 max-w-3xl font-patrick">
            {agent.characterConfig?.bio || 
              "No bio available for this agent."}
          </p>
        </div>
      </div>
    </div>
  );
});

AgentHeader.displayName = 'AgentHeader';

export default AgentHeader;

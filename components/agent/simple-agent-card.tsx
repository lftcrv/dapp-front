'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitFork, ExternalLink } from 'lucide-react';
import { Agent } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

interface SimpleAgentCardProps {
  agent: Agent;
  created?: string;
  by?: string;
}

export default function SimpleAgentCard({
  agent,
  created,
  by,
}: SimpleAgentCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';
  const isLeftCurve = agent.type === 'leftcurve';

  useEffect(() => {
    if (agent.profilePictureUrl) {
      // Handle URL construction properly
      const fullUrl = agent.profilePictureUrl.startsWith('http')
        ? agent.profilePictureUrl
        : `${backendUrl}${agent.profilePictureUrl}`;
      setImageUrl(fullUrl);
    }
  }, [agent.profilePictureUrl, backendUrl]);

  return (
    <div className="rounded-lg overflow-hidden relative bg-[#232229] text-white border border-gray-800 shadow-lg mb-6">
      <div className="p-4 flex items-center space-x-4 relative">
        {/* Agent Avatar */}
        <div className="w-16 h-16 relative flex-shrink-0">
          {/* Gradient border wrapper */}
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500 to-purple-500 p-[1px]">
            <div className="w-full h-full rounded-md overflow-hidden bg-gray-800">
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
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-800"><span class="text-2xl">${
                        isLeftCurve ? '🦧' : '🐙'
                      }</span></div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-2xl">{isLeftCurve ? '🦧' : '🐙'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name and Info Section */}
        <div className="flex flex-col flex-grow">
          {/* Agent Name and Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <div>
              <h3 className="text-xl font-sketch text-white">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-green-300 bg-green-500/10 border-green-500/30 text-xs rounded-full px-2 py-0.5 h-5"
                >
                  Active
                </Badge>
                <Badge
                  variant="outline"
                  className="text-orange-300 bg-orange-500/10 border-orange-500/30 text-xs rounded-full px-2 py-0.5 h-5"
                >
                  Parent
                </Badge>
              </div>
            </div>

            {/* Buttons - Hidden on mobile, visible on md and up */}
            <div className="hidden md:flex items-center gap-2 mt-2 md:mt-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r cursor-not-allowed hover:from-orange-500 hover:to-purple-500 text-white hover:opacity-90 flex items-center border border-white opacity-80"
                    >
                      <GitFork className="mr-2 h-4 w-4" />
                      Fork Agent
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                    <p className="text-sm font-medium">Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Starkscan
              </Button>
            </div>
          </div>

          {/* Created info - shown only if provided */}
          {created && (
            <div className="text-xs text-gray-400 mt-1">
              Created on {created}
              {by && (
                <>
                  {' - by '}
                  <Link
                    href={`/creators/${by}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2 decoration-blue-400/50 hover:decoration-blue-300/70"
                    title={`View creator ${by}`}
                  >
                    {by.startsWith('0x') && by.length > 10
                      ? `${by.substring(0, 6)}...${by.substring(by.length - 4)}`
                      : by}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-8 pb-4  text-white/80 text-sm font-patrick leading-relaxed">
        {agent.characterConfig?.bio || 'No bio available for this agent.'}
      </div>

      {/* Mobile Buttons - Only visible on mobile */}
      <div className="flex items-center gap-2 px-4 pb-4 md:hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                disabled
                className="flex-1 bg-gradient-to-r cursor-not-allowed from-orange-500 to-purple-500 text-white hover:opacity-90 flex items-center justify-center opacity-80"
              >
                <GitFork className="mr-2 h-4 w-4" />
                Fork Agent
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
              <p className="text-sm font-medium">Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700 flex items-center justify-center"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Starkscan
        </Button>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
    </div>
  );
}

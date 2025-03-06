'use client';

import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Flame,
  Zap,
  ChevronUp,
  ChevronDown,
  Copy,
  ChevronRight,
  InfoIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAgentInfo } from '@/actions/agents/token/getTokenInfo';

// Types
interface AgentHeaderProps {
  agent?: Agent;
  isLoading?: boolean;
  error?: Error | null;
  children?: React.ReactNode;
}

// Loading component
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

// Error component
const ErrorState = memo(({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertDescription>Failed to load agent: {error.message}</AlertDescription>
  </Alert>
));
ErrorState.displayName = 'ErrorState';

// Avatar component
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

// Address component
const AgentAddress = memo(
  ({
    contractAddress,
    isLeftCurve,
  }: {
    contractAddress: string;
    isLeftCurve: boolean;
  }) => {
    const [showCopied, setShowCopied] = useState(false);

    const handleCopyAddress = () => {
      navigator.clipboard.writeText(contractAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1000);
    };

    return (
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
          {contractAddress.slice(0, 6)}...
          {contractAddress.slice(-4)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-gray-100/10"
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
    );
  },
);
AgentAddress.displayName = 'AgentAddress';

// Type badge component
const AgentTypeBadge = memo(
  ({
    isLeftCurve,
    gradientClass,
  }: {
    isLeftCurve: boolean;
    gradientClass: string;
  }) => (
    <Badge
      variant={isLeftCurve ? 'default' : 'secondary'}
      className={cn('bg-gradient-to-r font-mono text-white', gradientClass)}
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
  ),
);
AgentTypeBadge.displayName = 'AgentTypeBadge';

// Agent Details Modal
const AgentDetailsModal = memo(
  ({
    agent,
    isOpen,
    onClose,
    isLeftCurve,
    gradientClass,
  }: {
    agent: Agent;
    isOpen: boolean;
    onClose: () => void;
    isLeftCurve: boolean;
    gradientClass: string;
  }) => {
    const loreItems = agent.characterConfig?.lore || [];
    const objectives = agent.characterConfig?.objectives || [];
    const knowledge = agent.characterConfig?.knowledge || [];

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle
              className={cn(
                'text-2xl font-sketch bg-gradient-to-r text-transparent bg-clip-text',
                gradientClass,
              )}
            >
              {agent.name}
            </DialogTitle>
            <DialogDescription>
              Complete agent profile and configuration
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="bio" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="bio" className="flex-1">
                Bio
              </TabsTrigger>
              <TabsTrigger value="lore" className="flex-1">
                Lore
              </TabsTrigger>
              <TabsTrigger value="objectives" className="flex-1">
                Objectives
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex-1">
                Knowledge
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bio" className="space-y-4">
              <div
                className={cn(
                  'p-4 rounded-lg border-2',
                  isLeftCurve
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-purple-500/5 border-purple-500/20',
                )}
              >
                <p className="font-medium leading-relaxed">
                  {agent.characterConfig?.bio || 'No bio available'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="lore" className="space-y-4">
              <div
                className={cn(
                  'p-4 rounded-lg border-2',
                  isLeftCurve
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-purple-500/5 border-purple-500/20',
                )}
              >
                {loreItems.length > 0 ? (
                  <ul className="space-y-2">
                    {loreItems.map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChevronRight
                          className={cn(
                            'h-5 w-5 mt-0.5 flex-shrink-0',
                            isLeftCurve ? 'text-yellow-500' : 'text-purple-500',
                          )}
                        />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    No lore available
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="objectives" className="space-y-4">
              <div
                className={cn(
                  'p-4 rounded-lg border-2',
                  isLeftCurve
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-purple-500/5 border-purple-500/20',
                )}
              >
                {objectives.length > 0 ? (
                  <ul className="space-y-2">
                    {objectives.map((objective, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChevronRight
                          className={cn(
                            'h-5 w-5 mt-0.5 flex-shrink-0',
                            isLeftCurve ? 'text-yellow-500' : 'text-purple-500',
                          )}
                        />
                        <span>{objective}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    No objectives available
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <div
                className={cn(
                  'p-4 rounded-lg border-2',
                  isLeftCurve
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-purple-500/5 border-purple-500/20',
                )}
              >
                {knowledge.length > 0 ? (
                  <ul className="space-y-2">
                    {knowledge.map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChevronRight
                          className={cn(
                            'h-5 w-5 mt-0.5 flex-shrink-0',
                            isLeftCurve ? 'text-yellow-500' : 'text-purple-500',
                          )}
                        />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    No knowledge available
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  },
);
AgentDetailsModal.displayName = 'AgentDetailsModal';

// Agent Bio Box
const AgentBioBox = memo(
  ({
    agent,
    isLeftCurve,
    onViewDetailsClick,
  }: {
    agent: Agent;
    isLeftCurve: boolean;
    onViewDetailsClick: () => void;
  }) => {
    // Get the bio from characterConfig or use a fallback
    const bio =
      agent.characterConfig?.bio ||
      (isLeftCurve
        ? "Born in the depths of /biz/, forged in the fires of leverage trading. This absolute unit of an ape doesn't know what 'risk management' means. Moon or food stamps, there is no in-between. 🚀🦧"
        : 'A sophisticated trading entity utilizing advanced quantitative analysis and machine learning. Precision entries, calculated exits, and a complete disregard for human emotions. Pure alpha generation. 🐙📊');

    return (
      <motion.div
        className={cn(
          'rounded-lg border-2 relative mt-4 flex items-center',
          isLeftCurve
            ? 'bg-yellow-500/5 border-yellow-500/20'
            : 'bg-purple-500/5 border-purple-500/20',
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="p-3 py-2.5 flex-1">
          <p className="font-medium leading-tight text-sm line-clamp-2">
            {bio}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetailsClick}
          className={cn(
            'h-full rounded-l-none border-l-2 px-2',
            isLeftCurve
              ? 'text-yellow-600 hover:text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/10'
              : 'text-purple-600 hover:text-purple-700 border-purple-500/20 hover:bg-purple-500/10',
          )}
        >
          <InfoIcon className="h-4 w-4" />
          <span className="sr-only">View complete profile</span>
        </Button>
      </motion.div>
    );
  },
);
AgentBioBox.displayName = 'AgentBioBox';

const AgentHeader = memo(({ agent, isLoading, error }: AgentHeaderProps) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
      className="mb-8 flex flex-col lg:flex-row items-start gap-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full lg:w-2/3">
        <AgentAvatar
          agent={agent}
          isLeftCurve={isLeftCurve}
          priceChange={priceChange}
        />

        <div className="space-y-3 flex-1 w-full">
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
          </div>
          <motion.div
            className="flex flex-wrap items-center gap-4 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AgentAddress
              contractAddress={agent.contractAddress}
              isLeftCurve={isLeftCurve}
            />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-4 w-4" />
              Created {agent.createdAt}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 w-full lg:w-1/3">
        <AgentBioBox
          agent={agent}
          isLeftCurve={isLeftCurve}
          onViewDetailsClick={() => setIsDetailsModalOpen(true)}
        />
      </div>

      <AgentDetailsModal
        agent={agent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        isLeftCurve={isLeftCurve}
        gradientClass={gradientClass}
      />
    </motion.div>
  );
});
AgentHeader.displayName = 'AgentHeader';

export { AgentHeader };

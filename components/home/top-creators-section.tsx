'use client';

import { motion } from 'framer-motion';
import { CreatorLeaderboardEntryDto } from './creator-card';
import CreatorCard from './creator-card';

import EmptyState from '@/components/ui/empty-state';
import { Suspense } from 'react';

interface TopCreatorsSectionProps {
  creators: CreatorLeaderboardEntryDto[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isRefetching?: boolean;
  handleRetry?: () => void;
}

const TopCreatorsSection = ({
  creators,
  error,
  isRefetching = false,
  handleRetry,
}: TopCreatorsSectionProps) => {
  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12,
      },
    },
  };

  return (
    <div className="mb-12">
      <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
        <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
          <span className="mr-2">Cycle kings</span>
          <span className="text-yellow-500">👑</span>
        </h2>

        <Suspense fallback={<CreatorsSkeleton />}>
          {error ? (
            <EmptyState
              title="Couldn't Load Creators"
              description="We encountered an issue while fetching the creators data. Please try again."
              icon="agents"
              onRetry={handleRetry}
              isLoading={isRefetching}
            />
          ) : !creators || creators.length === 0 ? (
            <EmptyState
              title="No Creators Found"
              description="Be the first to create an agent and become a top creator!"
              icon="agents"
              onRetry={handleRetry}
              isLoading={isRefetching}
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main layout with the first two creators in larger cards */}
              {creators.length > 1 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <motion.div
                      variants={itemVariants}
                      key={creators[0].creatorId}
                    >
                      <CreatorCard creator={creators[0]} index={0} />
                    </motion.div>
                    <motion.div
                      variants={itemVariants}
                      key={creators[1].creatorId}
                    >
                      <CreatorCard creator={creators[1]} index={1} />
                    </motion.div>
                  </div>

                  {/* Remaining creators in smaller cards */}
                  {creators.length > 2 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {creators.slice(2).map((creator, index) => (
                        <motion.div
                          key={creator.creatorId}
                          variants={itemVariants}
                        >
                          <CreatorCard creator={creator} index={index + 2} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Fallback for single creator
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creators.map((creator, index) => (
                    <motion.div key={creator.creatorId} variants={itemVariants}>
                      <CreatorCard creator={creator} index={index} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </Suspense>
      </div>
    </div>
  );
};

// Skeleton component for loading state
const CreatorsSkeleton = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-200/70 h-36 rounded-xl animate-pulse" />
        <div className="bg-gray-200/70 h-36 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-200/70 h-24 rounded-xl animate-pulse"
            />
          ))}
      </div>
    </>
  );
};

export default TopCreatorsSection;

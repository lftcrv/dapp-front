'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreatorCard, CreatorCardSkeleton } from '@/components/creators/creator-card';

// Define the expected structure for a creator object within this component
// This should align with the props CreatorCard expects, plus any other fields
// CreatorsSection might use directly (though currently it primarily passes them down).
// This replaces the old, simpler Creator interface.
interface UICreatorForSection {
  id: string;
  name: string;
  avatarUrl?: string;
  agentCount: number;
  runningAgents?: number;
  totalPnl: number;     // Cycle PnL
  totalTradeCount?: number; // Total trades for the creator
  balance?: number;     // Total Balance
  createdAt: string;    // Date (from updatedAt)
  // The 'index' for CreatorCard will be added during the map
}

interface CreatorsSectionProps {
  creators: UICreatorForSection[]; // Use the updated interface
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: string;
  visibleCount: number;
  canLoadMore: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onLoadMore: () => void;
}

export default function CreatorsSection({
  creators,
  isLoading,
  error,
  searchTerm,
  sortBy,
  visibleCount,
  canLoadMore,
  onSearchChange,
  onSortChange,
  onLoadMore,
}: CreatorsSectionProps) {
  return (
    <div className="mb-12">
      <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
        <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
          <span className="mr-2">Creators</span>
          <span className="text-purple-500">🧙‍♂️</span>
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Input
              type="search"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-48"
            />
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pnl_desc">PnL: High to Low</SelectItem>
                <SelectItem value="pnl_asc">PnL: Low to High</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name_asc">Name: A to Z</SelectItem>
                <SelectItem value="name_desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div
            className="bg-destructive/15 text-destructive p-4 rounded-md text-center mb-6"
            role="alert"
          >
            <p>Error loading creators: {error}</p>
          </div>
        )}

        {isLoading && creators.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <CreatorCardSkeleton key={`skeleton-${index}`} index={index} />
            ))}
          </div>
        )}

        {!error && creators.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {creators.slice(0, visibleCount).map((creator, index) => (
              // CreatorCard now receives all necessary props from UICreatorForSection
              <CreatorCard
                key={creator.id} // This key is essential and correctly placed
                id={creator.id}
                name={creator.name}
                avatarUrl={creator.avatarUrl}
                agentCount={creator.agentCount}
                runningAgents={creator.runningAgents}
                totalPnl={creator.totalPnl}
                totalTradeCount={creator.totalTradeCount}
                balance={creator.balance}
                createdAt={creator.createdAt}
                index={index} // Pass the map index for alternating colors in CreatorCard
              />
            ))}
          </div>
        )}

        {!isLoading && !error && creators.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            <p>
              {searchTerm
                ? 'No creators match your search.'
                : 'No creators found.'}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && !error && canLoadMore && (
          <div className="text-center mt-8">
            <Button onClick={onLoadMore} variant="outline">
              Load More Creators
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 
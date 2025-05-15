'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Background from '@/components/ui/background';
import CreatorsSection from '@/components/creators/creators-section';
import { getPaginatedCreators } from '@/actions/creators/getPaginatedCreators';
import {
  LeaderboardSortField,
  CreatorLeaderboardEntryDto,
} from '@/actions/creators/creator-types';

// Updated UICreator interface to include totalTradeCount
interface UICreator {
  id: string;
  name: string; 
  avatarUrl?: string;
  agentCount: number;
  runningAgents?: number;
  totalPnl: number;     
  // pnl24h?: number;      // REMOVED
  totalTradeCount?: number; // NEW
  balance?: number;     
  createdAt: string;    
}

// Updated mapper function
const mapDtoToUICreator = (dto: CreatorLeaderboardEntryDto): UICreator => {
  const displayName = (dto as any).name || `${dto.creatorId.substring(0, 8)}...`; 
  return {
    id: dto.creatorId,
    name: displayName,
    avatarUrl: (dto as any).avatarUrl, 
    agentCount: dto.totalAgents,
    runningAgents: dto.runningAgents,
    totalPnl: dto.aggregatedPnlCycle || 0,
    // pnl24h: dto.aggregatedPnl24h || 0, // REMOVED
    totalTradeCount: dto.totalTradeCount || 0, // Directly access if DTO is updated
    balance: dto.totalBalanceInUSD || 0,
    createdAt: dto.updatedAt, 
  };
};

const ITEMS_PER_PAGE = 8;

export default function CreatorsPage() {
  const [allCreatorsFromApi, setAllCreatorsFromApi] = useState<CreatorLeaderboardEntryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('pnl_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCreators, setTotalCreators] = useState(0);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const loadCreatorsData = useCallback(async (
    page: number,
    resetExisting: boolean = false,
  ) => {
    setIsLoading(true);
    if (resetExisting) {
      setAllCreatorsFromApi([]); 
      setError(null);
      setVisibleCount(ITEMS_PER_PAGE);
    }
    try {
      let serverSortBy: LeaderboardSortField | undefined = undefined;
      if (sortBy === 'pnl_desc') {
        serverSortBy = LeaderboardSortField.PNL_CYCLE;
      }
      
      const result = await getPaginatedCreators(page, ITEMS_PER_PAGE, serverSortBy);

      if (result.error) {
        setError(result.error);
        return;
      }

      setAllCreatorsFromApi((prev) => 
        resetExisting ? result.creators : [...prev, ...result.creators]
      );
      setTotalCreators(result.total);
      setCurrentPage(result.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadCreatorsData(1, true);
  }, [loadCreatorsData]);

  
  const processedCreatorsForDisplay: UICreator[] = useMemo(() => {
    
    let uiCreators = allCreatorsFromApi.map(mapDtoToUICreator);

    if (searchTerm) {
      uiCreators = uiCreators.filter((creator) =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'pnl_desc':
        uiCreators.sort((a, b) => (b.totalPnl || 0) - (a.totalPnl || 0));
        break;
      case 'pnl_asc':
        uiCreators.sort((a, b) => (a.totalPnl || 0) - (b.totalPnl || 0));
        break;
      case 'newest':
        uiCreators.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        uiCreators.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name_asc':
        uiCreators.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
         uiCreators.sort((a, b) => b.name.localeCompare(a.name));
         break;
    }
    return uiCreators;
  }, [allCreatorsFromApi, searchTerm, sortBy]);

  const handleLoadMore = async () => {
    if (processedCreatorsForDisplay.length > visibleCount) {
      setVisibleCount((prevCount) => prevCount + ITEMS_PER_PAGE);
    } else if (allCreatorsFromApi.length < totalCreators) { 
      await loadCreatorsData(currentPage + 1);
      
      setVisibleCount(prevCount => Math.min(prevCount + ITEMS_PER_PAGE, totalCreators));
    }
  };

  const canLoadMore =
    visibleCount < processedCreatorsForDisplay.length || allCreatorsFromApi.length < totalCreators;

  const handleSortChange = (newSortValue: string) => {
    setSortBy(newSortValue);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#F6ECE7]">
      <Background />
      <div className="container max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <CreatorsSection
          creators={processedCreatorsForDisplay} 
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          sortBy={sortBy}
          visibleCount={visibleCount}
          canLoadMore={canLoadMore}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onLoadMore={handleLoadMore}
        />
      </div>
    </main>
  );
}

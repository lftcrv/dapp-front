'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { CreatorCard, CreatorCardSkeleton } from '@/components/creators/creator-card'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Placeholder data structure - Add createdAt and totalPnl
interface Creator {
  id: string
  name: string
  avatarUrl?: string
  agentCount: number
  createdAt: string // Assuming ISO date string from API
  totalPnl: number // Example PnL data
}

// Mock API function - Add createdAt and totalPnl to mock data
async function fetchCreators(): Promise<Creator[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return mock data with new fields
  const baseDate = new Date(); // Use a base date for relative sorting
  return [
    { id: '1', name: 'Alice Wonderland', agentCount: 5, avatarUrl: 'https://avatar.vercel.sh/alice', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), totalPnl: 150.75 },
    { id: '2', name: 'Bob The Builder', agentCount: 12, avatarUrl: 'https://avatar.vercel.sh/bob', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), totalPnl: -50.20 },
    { id: '3', name: 'Charlie Chaplin', agentCount: 1, createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 2).toISOString(), totalPnl: 1200.00 },
    { id: '4', name: 'David Copperfield Has a Very Long Name', agentCount: 8, avatarUrl: 'https://avatar.vercel.sh/david', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(), totalPnl: 85.10 },
    { id: '5', name: 'Eve', agentCount: 3, createdAt: baseDate.toISOString(), totalPnl: 0.00 }, // Newest
    { id: '6', name: 'Frank Sinatra', agentCount: 20, avatarUrl: 'https://avatar.vercel.sh/frank', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(), totalPnl: 5500.50 }, // Highest PnL
    { id: '7', name: 'Grace Hopper', agentCount: 7, avatarUrl: 'https://avatar.vercel.sh/grace', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), totalPnl: 300.00 },
    { id: '8', name: 'Heidi Klum', agentCount: 2, avatarUrl: 'https://avatar.vercel.sh/heidi', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 30).toISOString(), totalPnl: -1500.99 }, // Lowest PnL
    { id: '9', name: 'Isaac Newton', agentCount: 4, createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(), totalPnl: 100.00 },
    { id: '10', name: 'Jane Austen', agentCount: 6, avatarUrl: 'https://avatar.vercel.sh/jane', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), totalPnl: 250.00 },
    { id: '11', name: 'King Arthur', agentCount: 9, createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(), totalPnl: -20.00 },
    { id: '12', name: 'Leonardo Da Vinci', agentCount: 15, avatarUrl: 'https://avatar.vercel.sh/leo', createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString(), totalPnl: 999.99 },
  ].sort((a, b) => Math.random() - 0.5); // Randomize initial order slightly like an API might
}

const ITEMS_PER_PAGE = 10; // Number of items to load each time

export default function CreatorsPage() {
  const [allCreators, setAllCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('pnl_desc'); // Default sort: PnL Descending
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE); // State for load more

  useEffect(() => {
    async function loadCreators() {
      setIsLoading(true)
      setError(null)
      setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on new fetch
      try {
        const data = await fetchCreators()
        setAllCreators(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
      } finally {
        setIsLoading(false)
      }
    }
    loadCreators()
  }, [])

  // Filter and sort creators
  const filteredAndSortedCreators = useMemo(() => {
    let creators = [...allCreators];

    // Filter by search term
    if (searchTerm) {
      creators = creators.filter((creator) =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort based on sortBy value
    switch (sortBy) {
      case 'pnl_desc':
        creators.sort((a, b) => b.totalPnl - a.totalPnl);
        break;
      case 'pnl_asc':
        creators.sort((a, b) => a.totalPnl - b.totalPnl);
        break;
      case 'newest':
        creators.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        creators.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name_asc':
        creators.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
         creators.sort((a, b) => b.name.localeCompare(a.name));
         break;
       // Add more cases if needed (e.g., by agent count)
    }

    return creators;
  }, [allCreators, searchTerm, sortBy]);

  // Get the creators to display based on visibleCount
  const creatorsToDisplay = useMemo(() => {
      return filteredAndSortedCreators.slice(0, visibleCount);
  }, [filteredAndSortedCreators, visibleCount]);

  const handleLoadMore = () => {
      setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const canLoadMore = visibleCount < filteredAndSortedCreators.length;

  return (
    <div className="container mx-auto px-4 pt-28 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-left w-full md:w-auto">Creators</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input 
            type="search"
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on search
            }}
            className="w-full sm:w-48"
          />
          <Select value={sortBy} onValueChange={(value) => { 
              setSortBy(value); 
              setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on sort change
            }}>
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

      {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <CreatorCardSkeleton key={`skeleton-${index}`} />
              ))}
          </div>
      )}

      {!isLoading && !error && creatorsToDisplay.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {creatorsToDisplay.map((creator) => (
            <CreatorCard key={creator.id} {...creator} />
          ))}
        </div>
      )}

      {!isLoading && !error && filteredAndSortedCreators.length === 0 && (
         <div className="text-center text-muted-foreground col-span-full py-10">
           <p>{searchTerm ? 'No creators match your search.' : 'No creators found.'}</p>
         </div>
      )}

      {/* Load More Button */} 
      {!isLoading && !error && canLoadMore && (
          <div className="text-center mt-8">
              <Button onClick={handleLoadMore} variant="outline">
                  Load More Creators
              </Button>
          </div>
      )}
    </div>
  )
} 
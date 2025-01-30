'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';

interface SortConfig {
  key: keyof Agent;
  direction: 'asc' | 'desc';
}

export function useAgentTable(agents: Agent[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredAgents = [...agents]
    .sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    })
    .filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const toggleSort = (key: keyof Agent) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return {
    sortConfig,
    searchTerm,
    setSearchTerm,
    toggleSort,
    agents: sortedAndFilteredAgents,
  };
}

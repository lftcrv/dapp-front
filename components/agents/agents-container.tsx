'use client'

import { useState } from 'react'
import { Agent } from '@/lib/types'
import { AgentTable } from './agent-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ArrowUpDown, Skull } from 'lucide-react'

interface AgentsContainerProps {
  agents: Agent[]
  isLoading: boolean
  error: Error | null
}

export function AgentsContainer({ agents, isLoading, error }: AgentsContainerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent
    direction: 'asc' | 'desc'
  }>({ key: 'createdAt', direction: 'desc' })

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toString().includes(searchTerm) ||
    agent.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort agents based on current sort config
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (!aValue || !bValue) return 0
    if (aValue === bValue) return 0
    
    const compareResult = aValue < bValue ? -1 : 1
    return sortConfig.direction === 'asc' ? compareResult : -compareResult
  })

  const handleSort = (key: keyof Agent) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      {/* Header with Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="font-sketch text-2xl flex items-center gap-2">
            <span className="text-orange-500">DEGEN</span>
            <Skull className="w-5 h-5" />
            <span className="text-purple-500">SIGMA</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400">default:</p>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => handleSort('createdAt')}
              className="h-6 text-xs font-mono hover:text-primary p-0"
            >
              {sortConfig.key === 'createdAt' && sortConfig.direction === 'desc' ? 'newest first' : 'oldest first'}
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name/symbol/id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs bg-white/5"
          />
        </div>
      </div>

      {/* Agent Table */}
      <AgentTable 
        agents={sortedAgents}
        isLoading={isLoading}
        error={error}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  )
} 
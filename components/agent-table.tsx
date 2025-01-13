'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Agent } from "@/lib/types"
import { cn, isInBondingPhase } from "@/lib/utils"
import { AgentAvatar } from "./top-agents"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search } from "lucide-react"
import Link from "next/link"

interface AgentTableProps {
  agents: Agent[]
}

function PriceChange() {
  const [change, setChange] = useState({ value: 0, isPositive: true })

  useEffect(() => {
    setChange({
      value: Math.random() * 20,
      isPositive: Math.random() > 0.5
    })
  }, [])

  if (change.value === 0) return null

  return (
    <span className={cn(
      "text-xs font-mono",
      change.isPositive ? "text-green-500" : "text-red-500"
    )}>
      {change.isPositive ? "+" : "-"}{change.value.toFixed(2)}%
    </span>
  )
}

export function AgentTable({ agents }: AgentTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent;
    direction: 'asc' | 'desc';
  }>({ key: 'createdAt', direction: 'desc' })
  const [searchTerm, setSearchTerm] = useState('')

  const sortedAgents = [...agents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  }).filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toString().includes(searchTerm)
  )

  const toggleSort = (key: keyof Agent) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="font-sketch text-xl">
            🎮 Agent Explorer
            <span className="text-xs font-normal text-gray-400 ml-2">sort & filter as you wish ser</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400">default:</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSort('createdAt')}
              className="h-6 text-xs font-mono hover:text-primary p-0"
            >
              {sortConfig.key === 'createdAt' && sortConfig.direction === 'desc' ? 'newest first' : 'oldest first'}
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs bg-white/5"
          />
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="w-[50px] text-xs">#</TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort('name')}
                  className="text-xs font-semibold hover:text-primary p-0"
                >
                  Agent <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-right text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort('price')}
                  className="text-xs font-semibold hover:text-primary p-0"
                >
                  Price <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right text-xs">24h</TableHead>
              <TableHead className="text-right text-xs">Market Cap</TableHead>
              <TableHead className="text-right text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort('holders')}
                  className="text-xs font-semibold hover:text-primary p-0"
                >
                  Holders <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAgents.map((agent, index) => (
              <TableRow key={agent.id} className="group hover:bg-white/5">
                <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                <TableCell>
                  <Link href={`/agent/${agent.id}`} className="flex items-center gap-3 hover:opacity-80">
                    <AgentAvatar src={agent.avatar} alt={agent.name} />
                    <div>
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">
                        {agent.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        #{agent.id}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center text-xs">
                    {agent.type === 'leftcurve' ? '🦧' : '🐙'}
                    <span className="ml-1 capitalize">{agent.type}</span>
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  ${agent.price.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <PriceChange />
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  ${(agent.price * agent.holders * 1000).toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {agent.holders.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      {
                        "bg-green-500/10 text-green-500": !isInBondingPhase(agent.price, agent.holders),
                        "bg-yellow-500/10 text-yellow-500": isInBondingPhase(agent.price, agent.holders),
                        "bg-gray-500/10 text-gray-500": agent.status === "ended",
                      }
                    )}
                  >
                    {isInBondingPhase(agent.price, agent.holders) ? '🔥 bonding' : agent.status === 'ended' ? '💀 ended' : '🚀 live'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
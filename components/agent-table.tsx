'use client'

import { Agent } from "@/lib/types"
import { cn, isInBondingPhase } from "@/lib/utils"
import { AgentAvatar } from "@/components/ui/agent-avatar"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search, Skull, Users } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';
    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  }).filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSort = (key: keyof Agent) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Agent }) => (
    <Button 
      variant="ghost" 
      onClick={() => toggleSort(sortKey)}
      className={cn(
        "text-xs font-semibold hover:text-primary p-0",
        sortConfig.key === sortKey && "text-primary"
      )}
    >
      {label} <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
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
            placeholder="Search by name/symbol/id..."
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
              <TableHead className="w-[50px] text-xs py-2">
                <SortableHeader label="#" sortKey="id" />
              </TableHead>
              <TableHead className="text-xs py-2">
                <SortableHeader label="Agent" sortKey="name" />
              </TableHead>
              <TableHead className="text-xs py-2">
                <span className={cn(
                  "inline-flex items-center cursor-pointer",
                  "hover:opacity-80 transition-opacity"
                )} onClick={() => toggleSort('type')}>
                  <span className="text-orange-500">🦧</span>
                  <span className="mx-1">/</span>
                  <span className="text-purple-500">🐙</span>
                </span>
              </TableHead>
              <TableHead className="text-right text-xs py-2">
                <SortableHeader label="Price" sortKey="price" />
              </TableHead>
              <TableHead className="text-right text-xs py-2">24h</TableHead>
              <TableHead className="text-right text-xs py-2">
                <SortableHeader label="Market Cap" sortKey="marketCap" />
              </TableHead>
              <TableHead className="text-right text-xs py-2">
                <SortableHeader label="Holders" sortKey="holders" />
              </TableHead>
              <TableHead className="text-right text-xs py-2">
                <SortableHeader label="Score" sortKey={sortConfig.key === 'creativityIndex' ? 'performanceIndex' : 'creativityIndex'} />
              </TableHead>
              <TableHead className="text-right text-xs py-2">
                <SortableHeader label="Status" sortKey="status" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAgents.map((agent, index) => (
              <TableRow key={agent.id} className="group hover:bg-white/5">
                <TableCell className="font-mono text-xs py-2">{index + 1}</TableCell>
                <TableCell className="py-2">
                  <Link href={`/agent/${agent.id}`} className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-7 h-7 relative rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                      <AgentAvatar src={agent.avatar} alt={agent.name} />
                    </div>
                    <div>
                      <div className="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {agent.name}
                        <span className="text-xs text-muted-foreground font-mono">
                          ${agent.symbol}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        #{agent.id}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="py-2">
                  <span className={cn(
                    "text-lg",
                    agent.type === 'leftcurve' ? "text-orange-500" : "text-purple-500"
                  )}>
                    {agent.type === 'leftcurve' ? '🦧' : '🐙'}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs py-2">
                  ${agent.price.toLocaleString()}
                </TableCell>
                <TableCell className="text-right py-2">
                  <PriceChange />
                </TableCell>
                <TableCell className="text-right font-mono text-xs py-2">
                  ${agent.marketCap.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-[10px] py-2">
                  <div className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5",
                    "bg-blue-500/20 text-black font-medium",
                    "justify-between w-16"
                  )}>
                    <Users className="w-2.5 h-2.5" />
                    {agent.holders.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex flex-col items-end">
                    <div className={cn(
                      "font-mono text-xs",
                      agent.type === 'leftcurve' ? "text-orange-500" : "text-purple-500"
                    )}>
                      {agent.type === 'leftcurve' 
                        ? `DEGEN ${(agent.creativityIndex * 100).toFixed(0)}%`
                        : `WIN ${(agent.performanceIndex * 100).toFixed(0)}%`
                      }
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {agent.type === 'leftcurve'
                        ? `win ${(agent.performanceIndex * 100).toFixed(0)}%`
                        : `degen ${(agent.creativityIndex * 100).toFixed(0)}%`
                      }
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
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
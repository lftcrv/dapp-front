'use client'

import { Agent } from "@/lib/types"
import { AgentAvatar } from "@/components/top-agents"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"

function LeaderboardTable({ 
  agents, 
  title, 
  type, 
  scoreKey 
}: { 
  agents: Agent[]
  title: string
  type: 'leftcurve' | 'rightcurve'
  scoreKey: 'creativityIndex' | 'performanceIndex'
}) {
  const sortedAgents = [...agents]
    .filter(agent => agent.type === type && agent[scoreKey] !== undefined)
    .sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
    .slice(0, 10)

  return (
    <motion.div 
      className="rounded-xl border border-white/10 bg-white/5 p-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: type === 'leftcurve' ? 0.2 : 0.4 }}
    >
      <h2 className={cn(
        "font-sketch text-lg mb-3 text-center",
        type === 'leftcurve' ? "text-yellow-500" : "text-pink-500"
      )}>
        {type === 'leftcurve' ? '🦧 ' : '🐙 '}{title}
        <div className="text-xs font-normal text-gray-400">top 10 {type === 'leftcurve' ? 'degens' : 'chads'}</div>
      </h2>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="w-[50px] text-xs p-2">Rank</TableHead>
              <TableHead className="text-xs p-2">Agent</TableHead>
              <TableHead className="text-right text-xs p-2">Score</TableHead>
              <TableHead className="text-right text-xs p-2 hidden sm:table-cell">Market Cap</TableHead>
              <TableHead className="text-right text-xs p-2 hidden sm:table-cell">Holders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAgents.map((agent, index) => (
              <motion.tr 
                key={agent.id} 
                className="group hover:bg-white/5"
                initial={{ opacity: 0, x: type === 'leftcurve' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <TableCell className="p-2">
                  <span className="font-mono text-xs">
                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex items-center gap-2">
                    <AgentAvatar src={agent.avatar} alt={agent.name} />
                    <div>
                      <div className="font-medium text-xs group-hover:text-primary transition-colors">
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        #{agent.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right p-2">
                  <div className="font-mono text-xs">
                    {agent[scoreKey]?.toFixed(2)}
                    <span className={cn(
                      "ml-1 text-[10px]",
                      type === 'leftcurve' ? "text-yellow-500" : "text-pink-500"
                    )}>
                      {type === 'leftcurve' ? 'DEGEN' : 'SIGMA'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs p-2 hidden sm:table-cell">
                  ${(agent.price * agent.holders * 1000).toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-xs p-2 hidden sm:table-cell">
                  {agent.holders.toLocaleString()}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}

export function LeaderboardTables({ agents }: { agents: Agent[] }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="text-4xl font-sketch text-white/10 rotate-0 sm:rotate-90"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          VS
        </motion.div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-12">
        <LeaderboardTable 
          agents={agents} 
          title="LeftCurve Kings" 
          type="leftcurve"
          scoreKey="creativityIndex"
        />
        <LeaderboardTable 
          agents={agents} 
          title="RightCurve Chads" 
          type="rightcurve"
          scoreKey="performanceIndex"
        />
      </div>
    </div>
  )
} 
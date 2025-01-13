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
  scoreKey,
  description 
}: { 
  agents: Agent[]
  title: string
  type: 'leftcurve' | 'rightcurve'
  scoreKey: 'creativityIndex' | 'performanceIndex'
  description: string
}) {
  const sortedAgents = [...agents]
    .filter(agent => agent.type === type)
    .sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
    .slice(0, 10)

  const formatPerformance = (value: number | undefined) => {
    if (!value) return '0%'
    return `${(value * 10).toFixed(1)}%`
  }

  return (
    <motion.div 
      className={cn(
        "rounded-xl border p-3 backdrop-blur-sm",
        type === 'leftcurve' 
          ? "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30" 
          : "border-pink-500/20 bg-pink-500/5 hover:border-pink-500/30"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: type === 'leftcurve' ? 0.2 : 0.4 }}
    >
      <h2 className={cn(
        "font-sketch text-2xl mb-1 text-center flex items-center justify-center gap-2",
        type === 'leftcurve' ? "text-yellow-500" : "text-pink-500"
      )}>
        {type === 'leftcurve' ? (
          <>🦧 {title} <span className="text-sm text-yellow-500/50">(trust me bro)</span></>
        ) : (
          <><span className="text-sm text-pink-500/50">(actually profitable)</span> {title} 🐙</>
        )}
      </h2>
      <p className="text-xs text-gray-400 text-center mb-3">{description}</p>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="w-[50px] text-xs p-2">Rank</TableHead>
              <TableHead className="text-xs p-2">Agent</TableHead>
              <TableHead className="text-right text-xs p-2">Market Cap</TableHead>
              <TableHead className="text-right text-xs p-2">
                {type === 'leftcurve' ? 'Creativity' : 'Win Rate'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAgents.map((agent, index) => (
              <motion.tr 
                key={agent.id} 
                className={cn(
                  "group transition-colors duration-200",
                  type === 'leftcurve' 
                    ? "hover:bg-yellow-500/5" 
                    : "hover:bg-pink-500/5"
                )}
                initial={{ opacity: 0, x: type === 'leftcurve' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <TableCell className="p-2">
                  <span className={cn(
                    "font-mono text-xs",
                    type === 'leftcurve' ? "text-yellow-500" : "text-pink-500"
                  )}>
                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex items-center gap-2">
                    <AgentAvatar src={agent.avatar} alt={agent.name} />
                    <div>
                      <div className={cn(
                        "font-medium text-xs transition-colors",
                        type === 'leftcurve' 
                          ? "group-hover:text-yellow-500" 
                          : "group-hover:text-pink-500"
                      )}>
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
                    ${(agent.price * agent.holders * 1000).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-right p-2">
                  <div className="font-mono text-xs">
                    {type === 'leftcurve' 
                      ? agent[scoreKey]?.toFixed(2)
                      : formatPerformance(agent[scoreKey])
                    }
                  </div>
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
    <div className="relative flex items-center justify-center min-h-[600px]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="text-6xl font-sketch text-white/20 rotate-0 sm:rotate-90 flex items-center gap-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span className="text-yellow-500/20">DEGEN</span>
          <span>VS</span>
          <span className="text-pink-500/20">SIGMA</span>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-16 max-w-7xl w-full">
        <LeaderboardTable 
          agents={agents} 
          title="LeftCurve Kings" 
          type="leftcurve"
          scoreKey="creativityIndex"
          description="Most innovative degen plays - trust your gut 🚀"
        />
        <LeaderboardTable 
          agents={agents} 
          title="RightCurve Chads" 
          type="rightcurve"
          scoreKey="performanceIndex"
          description="Pure alpha, no cap fr fr 📈"
        />
      </div>
    </div>
  )
} 
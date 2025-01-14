'use client'

import { Agent } from "@/lib/types"
import { AgentAvatar } from '@/components/ui/agent-avatar'
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
import { UserCircle } from "lucide-react"

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
    .filter(a => a.type === type)
    .sort((a, b) => b[scoreKey] - a[scoreKey])

  return (
    <motion.div 
      className={cn(
        "rounded-xl border p-4 backdrop-blur-sm flex-1",
        type === 'leftcurve' 
          ? "border-orange-500/20 bg-orange-950/5" 
          : "border-purple-500/20 bg-purple-950/5"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className={cn(
          "font-sketch text-2xl text-center",
          type === 'leftcurve' ? "text-orange-500" : "text-purple-500"
        )}>
          {title}
        </h2>
        <p className="text-sm text-muted-foreground text-center">{description}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAgents.map((agent, index) => (
            <TableRow key={agent.id}>
              <TableCell>
                <span className="font-mono text-sm">
                  {index === 0 ? '👑' : `#${index + 1}`}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                    {agent.avatar ? (
                      <AgentAvatar src={agent.avatar} alt={agent.name} />
                    ) : (
                      <UserCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-1.5">
                      {agent.name}
                      <span className="text-xs text-muted-foreground font-mono">
                        ${agent.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {agent.holders.toLocaleString()} holders
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                ${agent.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono">
                ${agent.marketCap.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className={cn(
                  "font-mono text-sm",
                  type === 'leftcurve' ? "text-orange-500" : "text-purple-500"
                )}>
                  {(agent[scoreKey] * 100).toFixed(0)}%
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  )
}

export function LeaderboardTables({ agents }: { agents: Agent[] }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <LeaderboardTable 
          agents={agents}
          title="LEFTCURVE KINGS"
          type="leftcurve"
          scoreKey="creativityIndex"
          description="Top degen agents by creativity score"
        />
        <LeaderboardTable 
          agents={agents}
          title="RIGHTCURVE LORDS"
          type="rightcurve"
          scoreKey="performanceIndex"
          description="Top quant agents by performance score"
        />
      </div>
    </div>
  )
} 
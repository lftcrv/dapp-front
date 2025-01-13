'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { BondingCurveChart } from '@/components/bonding-curve-chart'
import { SwapWidget } from '@/components/swap-widget'
import { TradeHistory } from '@/components/trade-history'
import { AgentChat } from '@/components/agent-chat'
import { dummyAgents } from '@/lib/dummy-data'
import { Badge } from '@/components/ui/badge'
import { Brain, Rocket, MessageCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AgentPage() {
  const params = useParams()
  const agentId = params.agentId as string
  
  // For now, use dummy data
  const agent = dummyAgents.find(a => a.id === agentId)
  
  if (!agent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start pt-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <span className="text-6xl">😵</span>
            <h1 className="font-sketch text-2xl">Agent Not Found</h1>
            <p className="text-muted-foreground">This agent is lost in the matrix...</p>
          </div>
        </div>
      </main>
    )
  }

  const isLeftCurve = agent.type === 'leftcurve'
  const gradientClass = isLeftCurve 
    ? 'from-yellow-500 to-pink-500'
    : 'from-purple-500 to-pink-500'

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-6">
            {/* Agent Avatar */}
            <motion.div 
              className={cn(
                "w-20 h-20 rounded-full overflow-hidden bg-white/5 ring-2 ring-offset-2 ring-offset-background",
                isLeftCurve ? "ring-yellow-500" : "ring-purple-500"
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {agent.avatar ? (
                <img 
                  src={agent.avatar} 
                  alt={agent.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = target.parentElement?.querySelector('div');
                    if (fallback) {
                      target.style.display = 'none';
                      fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full items-center justify-center bg-white/5"
                style={{ display: agent.avatar ? 'none' : 'flex' }}
              >
                {isLeftCurve ? (
                  <span className="text-3xl">🦧</span>
                ) : (
                  <span className="text-3xl">🐙</span>
                )}
              </div>
            </motion.div>

            {/* Agent Info */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-sketch text-3xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
                  {agent.name}
                </h1>
                <Badge variant={isLeftCurve ? 'default' : 'secondary'} className={`bg-gradient-to-r ${gradientClass}`}>
                  {isLeftCurve ? '🦧 LeftCurve' : '🐙 RightCurve'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>by {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}</span>
                <span>•</span>
                <span>Created {agent.createdAt}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {agent.lore || (isLeftCurve 
                  ? 'A galaxy-brain ape trading with pure degen energy 🚀'
                  : 'A sophisticated octopus mastering the art of technical analysis 📊'
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Price Chart */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4" />
                <h3 className="font-medium">Price Chart</h3>
              </div>
              <BondingCurveChart agent={agent} />
            </Card>

            {/* Trade History */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="h-4 w-4" />
                <h3 className="font-medium">Recent Trades</h3>
              </div>
              <TradeHistory agent={agent} />
            </Card>

            {/* Agent Chat */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-4 w-4" />
                <h3 className="font-medium">Community Chat</h3>
              </div>
              <AgentChat agent={agent} />
            </Card>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Swap Widget */}
            <Card className="p-6">
              <SwapWidget agent={agent} />
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Agent Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono font-bold">${agent.price.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Holders</span>
                  <span className="font-mono font-bold">{agent.holders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-mono font-bold">
                    ${(agent.price * agent.holders * 1000).toLocaleString()}
                  </span>
                </div>
                {isLeftCurve ? (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-500/10">
                    <span className="text-muted-foreground">Degen Score</span>
                    <span className="font-mono font-bold text-yellow-500">
                      {agent.creativityIndex?.toFixed(2)} 🦧
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-purple-500/10">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-mono font-bold text-purple-500">
                      {(agent.performanceIndex || 0 * 100).toFixed(1)}% 🐙
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
} 
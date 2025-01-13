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
import { Brain, Rocket, MessageCircle, TrendingUp, Zap, Flame, ChevronUp, ChevronDown } from 'lucide-react'
import { cn, isInBondingPhase } from '@/lib/utils'
import { PriceChart } from '@/components/price-chart'
import Image from 'next/image'
import { getDummyPriceData } from '@/lib/dummy-prices'

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
    ? 'from-yellow-500 via-orange-500 to-pink-500'
    : 'from-purple-500 via-indigo-500 to-blue-500'
  
  const priceChange = ((agent.price - 1) / 1) * 100
  const isPriceUp = priceChange > 0

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
                "w-24 h-24 rounded-xl overflow-hidden bg-white/5 ring-4 ring-offset-4 ring-offset-background relative",
                isLeftCurve ? "ring-yellow-500/50" : "ring-purple-500/50"
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {agent.avatar ? (
                <Image 
                  src={agent.avatar} 
                  alt={agent.name} 
                  fill
                  className="object-cover"
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
                className={cn(
                  "w-full h-full items-center justify-center",
                  isLeftCurve ? "bg-yellow-500/10" : "bg-purple-500/10"
                )}
                style={{ display: agent.avatar ? 'none' : 'flex' }}
              >
                {isLeftCurve ? (
                  <span className="text-4xl">🦧</span>
                ) : (
                  <span className="text-4xl">🐙</span>
                )}
              </div>
              {/* Price change indicator */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 px-2 py-1 text-xs font-bold font-mono flex items-center justify-center gap-1",
                isPriceUp 
                  ? "bg-green-500/90 text-white" 
                  : "bg-red-500/90 text-white"
              )}>
                {isPriceUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {Math.abs(priceChange).toFixed(2)}%
              </div>
            </motion.div>

            {/* Agent Info */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <h1 className={cn(
                  "font-sketch text-4xl bg-gradient-to-r text-transparent bg-clip-text",
                  gradientClass
                )}>
                  {agent.name}
                </h1>
                <Badge 
                  variant={isLeftCurve ? 'default' : 'secondary'} 
                  className={cn(
                    "bg-gradient-to-r font-mono text-white",
                    gradientClass
                  )}
                >
                  {isLeftCurve ? (
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5" />
                      DEGEN APE
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5" />
                      GALAXY BRAIN
                    </div>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className={cn(
                  "px-2 py-1 rounded-md font-mono",
                  isLeftCurve ? "bg-yellow-500/10 text-yellow-500" : "bg-purple-500/10 text-purple-500"
                )}>
                  {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  Created {agent.createdAt}
                </div>
              </div>

              <p className={cn(
                "text-sm max-w-2xl rounded-lg p-3 border-2",
                isLeftCurve 
                  ? "bg-yellow-500/5 border-yellow-500/20" 
                  : "bg-purple-500/5 border-purple-500/20"
              )}>
                {agent.lore || (isLeftCurve 
                  ? "Born in the depths of /biz/, forged in the fires of leverage trading. This absolute unit of an ape doesn't know what 'risk management' means. Moon or food stamps, there is no in-between. 🚀🦧" 
                  : "A sophisticated trading entity utilizing advanced quantitative analysis and machine learning. Precision entries, calculated exits, and a complete disregard for human emotions. Pure alpha generation. 🐙📊"
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
            <Card className={cn(
              "p-6 border-2",
              isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    isLeftCurve ? "text-yellow-500" : "text-purple-500"
                  )} />
                  <h3 className="font-medium">Price Action</h3>
                </div>
                <Badge variant="outline" className="font-mono">
                  {isLeftCurve ? "DEGEN MODE" : "GALAXY MODE"}
                </Badge>
              </div>
              <PriceChart 
                data={getDummyPriceData(agent.symbol, agent.price)} 
                symbol={agent.symbol}
                baseToken={agent.symbol}
                inBondingCurve={isInBondingPhase(agent.price, agent.holders)}
              />
            </Card>

            {/* Trade History */}
            <Card className={cn(
              "p-6 border-2",
              isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Rocket className={cn(
                    "h-4 w-4",
                    isLeftCurve ? "text-yellow-500" : "text-purple-500"
                  )} />
                  <h3 className="font-medium">Recent Trades</h3>
                </div>
                <Badge variant="outline" className="font-mono">
                  LIVE FEED
                </Badge>
              </div>
              <TradeHistory />
            </Card>

            {/* Agent Chat */}
            <Card className={cn(
              "p-6 border-2",
              isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className={cn(
                    "h-4 w-4",
                    isLeftCurve ? "text-yellow-500" : "text-purple-500"
                  )} />
                  <h3 className="font-medium">Community Chat</h3>
                </div>
                <Badge variant="outline" className="font-mono animate-pulse">
                  {isLeftCurve ? "APE TOGETHER 🦧" : "ALPHA ZONE 🐙"}
                </Badge>
              </div>
              <AgentChat />
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
            <Card className={cn(
              "border-2",
              isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50"
            )}>
              <SwapWidget agent={agent} />
            </Card>

            {/* Bonding Curve */}
            <BondingCurveChart agent={agent} />

            {/* Stats Card */}
            <Card className={cn(
              "p-6 border-2",
              isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50"
            )}>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Brain className={cn(
                  "h-4 w-4",
                  isLeftCurve ? "text-yellow-500" : "text-purple-500"
                )} />
                Performance Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className={cn(
                  "flex justify-between items-center p-2 rounded-lg",
                  isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5"
                )}>
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono font-bold">${agent.price.toFixed(4)}</span>
                </div>
                <div className={cn(
                  "flex justify-between items-center p-2 rounded-lg",
                  isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5"
                )}>
                  <span className="text-muted-foreground">Holders</span>
                  <span className="font-mono font-bold">{agent.holders.toLocaleString()}</span>
                </div>
                <div className={cn(
                  "flex justify-between items-center p-2 rounded-lg",
                  isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5"
                )}>
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-mono font-bold">
                    ${(agent.price * agent.holders * 1000).toLocaleString()}
                  </span>
                </div>
                {isLeftCurve ? (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                    <span className="text-yellow-500">Degen Score</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-yellow-500">
                        {agent.creativityIndex?.toFixed(2)}
                      </span>
                      <span className="text-xl">🦧</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                    <span className="text-purple-500">Win Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-500">
                        {(agent.performanceIndex || 0 * 100).toFixed(1)}%
                      </span>
                      <span className="text-xl">🐙</span>
                    </div>
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
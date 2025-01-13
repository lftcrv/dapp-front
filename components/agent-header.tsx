import { Badge } from '@/components/ui/badge'
import { Brain, Flame, Zap, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Agent } from '@/lib/types'

interface AgentHeaderProps {
  agent: Agent
}

export function AgentHeader({ agent }: AgentHeaderProps) {
  const isLeftCurve = agent.type === 'leftcurve'
  const gradientClass = isLeftCurve 
    ? 'from-yellow-500 via-orange-500 to-pink-500'
    : 'from-purple-500 via-indigo-500 to-blue-500'
  
  const priceChange = ((agent.price - 1) / 1) * 100
  const isPriceUp = priceChange > 0

  return (
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
  )
} 
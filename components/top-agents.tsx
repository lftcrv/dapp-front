'use client'

import { Agent } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { motion } from "framer-motion"
import { useEffect, useState } from 'react'
import { UserCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface TopAgentsProps {
  leftCurveAgents: Agent[]
  rightCurveAgents: Agent[]
}

export function AgentAvatar({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
        <UserCircle className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative w-12 h-12">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const isLeftCurve = agent.type === 'leftcurve'
  const router = useRouter()
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/agent/${agent.id}`)
  }

  const performanceColor = agent.performanceIndex > 0 ? 'text-green-500/90' : 'text-red-500/90'
  const performanceSign = agent.performanceIndex > 0 ? '+' : ''
  const performanceDisplay = `${performanceSign}${(agent.performanceIndex * 100).toFixed(1)}%`
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className={cn(
        "p-3 rounded-lg border h-full w-full cursor-pointer relative z-10",
        isLeftCurve 
          ? "bg-yellow-500/5 border-yellow-500/10 hover:border-yellow-500/20" 
          : "bg-purple-500/5 border-purple-500/10 hover:border-purple-500/20"
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center text-center w-full">
        <motion.div 
          className="mb-2"
          whileHover={{ scale: 1.05, rotate: isLeftCurve ? -5 : 5 }}
        >
          <AgentAvatar src={agent.avatar} alt={agent.name} />
        </motion.div>
        <h4 className={cn(
          "font-medium text-sm truncate w-full mb-1",
          isLeftCurve ? "text-yellow-500/90" : "text-purple-500/90"
        )}>{agent.name}</h4>
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono opacity-70">${agent.price.toFixed(2)}</span>
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("text-xs", performanceColor)}
          >
            {performanceDisplay}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

function TopAgentBox({ title, agents, type }: { title: string; agents: Agent[]; type: 'left' | 'right' }) {
  const [api, setApi] = useState<CarouselApi>()
  const isLeft = type === 'left'

  useEffect(() => {
    if (!api) return
    const interval = setInterval(
      () => api.scrollNext(), 
      isLeft ? 4200 : 3800
    )
    return () => clearInterval(interval)
  }, [api, isLeft])

  const loopedAgents = [...agents, ...agents]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex-1 p-4 rounded-lg border relative",
        isLeft 
          ? "bg-yellow-500/[0.02] border-yellow-500/10" 
          : "bg-purple-500/[0.02] border-purple-500/10"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isLeft ? '🦧' : '🐙'}</span>
          <div>
            <h3 className={cn(
              "font-medium text-sm",
              isLeft ? "text-yellow-500/70" : "text-purple-500/70"
            )}>
              {title}
            </h3>
            <span className="text-xs font-mono opacity-50">
              {isLeft ? 'degen vibes only' : 'galaxy brain time'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative group">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: false,
            skipSnaps: false,
            containScroll: "keepSnaps"
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {loopedAgents.map((agent, index) => (
              <CarouselItem 
                key={`${agent.id}-${index}`} 
                className="pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/5 pointer-events-auto"
              >
                <div className="h-full relative">
                  <AgentCard agent={agent} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="absolute -left-3 right-3 top-0 bottom-0 flex items-center justify-between z-20 pointer-events-none">
            <CarouselPrevious variant="ghost" size="sm" className={cn(
              "h-7 w-7 rounded-sm border-0 opacity-0 group-hover:opacity-100 transition-opacity relative -left-2 pointer-events-auto",
              isLeft 
                ? "hover:bg-yellow-500/5 text-yellow-500/70" 
                : "hover:bg-purple-500/5 text-purple-500/70"
            )} />
            <CarouselNext variant="ghost" size="sm" className={cn(
              "h-7 w-7 rounded-sm border-0 opacity-0 group-hover:opacity-100 transition-opacity relative -right-2 pointer-events-auto",
              isLeft 
                ? "hover:bg-yellow-500/5 text-yellow-500/70" 
                : "hover:bg-purple-500/5 text-purple-500/70"
            )} />
          </div>
        </Carousel>
      </div>
    </motion.div>
  )
}

export function TopAgents({ leftCurveAgents, rightCurveAgents }: TopAgentsProps) {
  return (
    <div className="space-y-3 w-full mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopAgentBox title="Based Degen Apes" agents={leftCurveAgents} type="left" />
        <TopAgentBox title="Galaxy Brain Chads" agents={rightCurveAgents} type="right" />
      </div>
    </div>
  )
} 
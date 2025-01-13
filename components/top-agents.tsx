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
  return (
    <Link href={`/agent/${agent.id}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-3 bg-white/5 rounded-xl border border-white/10 h-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div 
            className="mb-2"
            whileHover={{ scale: 1.05 }}
          >
            <AgentAvatar src={agent.avatar} alt={agent.name} />
          </motion.div>
          <h4 className="font-medium text-sm truncate w-full mb-1">{agent.name}</h4>
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono">${agent.price}</span>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-green-500 font-mono"
            >
              +12%
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function TopAgentBox({ title, agents, type }: { title: string; agents: Agent[]; type: 'left' | 'right' }) {
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [api])

  // Double the agents array to create an infinite loop effect
  const loopedAgents = [...agents, ...agents]

  return (
    <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
      <h3 className="font-sketch text-lg mb-4">
        {type === 'left' ? '🦧 ' : '🐙 '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-pink-500">
          {title}
        </span>
      </h3>
      <div className="relative">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <div className="absolute right-0 -top-12 flex gap-1 z-10">
            <CarouselPrevious variant="ghost" size="sm" className="h-6 w-6 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </CarouselPrevious>
            <CarouselNext variant="ghost" size="sm" className="h-6 w-6 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </CarouselNext>
          </div>
          <CarouselContent className="-ml-2">
            {loopedAgents.map((agent, index) => (
              <CarouselItem key={`${agent.id}-${index}`} className="pl-2 basis-1/3 sm:basis-1/4 lg:basis-1/5">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AgentCard agent={agent} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}

export function TopAgents({ leftCurveAgents, rightCurveAgents }: TopAgentsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
      <TopAgentBox title="Left Curve Degens" agents={leftCurveAgents} type="left" />
      <TopAgentBox title="Right Curve Chads" agents={rightCurveAgents} type="right" />
    </div>
  )
} 
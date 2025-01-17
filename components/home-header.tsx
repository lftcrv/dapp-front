'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Rocket, Flame } from 'lucide-react'
import { memo } from 'react'
import { motion } from 'framer-motion'

const Title = memo(() => (
  <motion.h1 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="font-sketch text-5xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text"
  >
    Trading Agent Arena
  </motion.h1>
))
Title.displayName = 'Title'

const Description = memo(() => (
  <div className="max-w-xl mx-auto space-y-1.5 text-[11px]">
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="text-neutral-800"
    >
      your strategy, your agent, your edge - finally executed exactly how you want it. embrace the chaos or master the precision - but don&apos;t you dare stay in the middle 😤
    </motion.p>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="text-neutral-800"
    >
      protocol fees? split between based curves only. midcurvers stay ngmi and get nothing fr
    </motion.p>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="text-neutral-500 font-mono text-[10px]"
    >
      where midcurvers get rekt 💀
    </motion.p>
  </div>
))
Description.displayName = 'Description'

const ActionButtons = memo(() => {
  const router = useRouter()
  
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        onClick={() => router.push('/create-agent')}
        className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 hover:opacity-90 font-mono text-white"
      >
        <Rocket className="mr-2 h-4 w-4" />
        Deploy Your Agent
      </Button>
      <Button 
        variant="outline" 
        className="group relative font-mono hover:text-yellow-500 transition-colors hover:border-yellow-500/50"
        onClick={() => router.push('/leaderboard')}
      >
        <Flame className="mr-2 h-4 w-4 transition-colors" />
        Leaderboard
      </Button>
    </div>
  )
})
ActionButtons.displayName = 'ActionButtons'

const HomeHeader = memo(() => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <Title />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm text-yellow-500/70 font-mono"
        >
          where midcurvers get rekt 💀
        </motion.p>
        <Description />
      </div>
      <ActionButtons />
    </div>
  )
})
HomeHeader.displayName = 'HomeHeader'

export default HomeHeader 
'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Rocket, Flame } from 'lucide-react'

export default function HomeHeader() {
  const router = useRouter()
  
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <h1 className="font-sketch text-5xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
          Trading Agent Arena
        </h1>
        <p className="text-sm text-yellow-500/70 font-mono">
          where midcurvers get rekt 💀
        </p>
        
        <div className="max-w-xl mx-auto space-y-1.5 text-[11px]">
          <p className="text-neutral-800">your strategy, your agent, your edge - finally executed exactly how you want it. embrace the chaos or master the precision - but don&apos;t you dare stay in the middle 😤</p>
          <p className="text-neutral-800">protocol fees? split between based curves only. midcurvers stay ngmi and get nothing fr</p>
          <p className="text-neutral-500 font-mono text-[10px]">where midcurvers get rekt 💀</p>
        </div>
      </div>

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
    </div>
  )
} 
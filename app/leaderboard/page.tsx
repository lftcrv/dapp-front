'use client'

import { dummyAgents } from "@/lib/dummy-data"
import { LeaderboardTables } from "@/components/leaderboard-tables"
import { motion } from "framer-motion"

export default function LeaderboardPage() {
  return (
    <div className="container max-w-7xl pt-24 pb-8 px-4">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-sketch text-3xl">
          🏆 Agent Leaderboards
          <span className="text-sm font-normal text-gray-400 ml-2">who&apos;s the most based?</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Updated every 5 minutes</p>
      </motion.div>

      <LeaderboardTables agents={dummyAgents} />
    </div>
  )
} 
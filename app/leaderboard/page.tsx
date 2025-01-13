'use client'

import { dummyAgents } from "@/lib/dummy-data"
import { LeaderboardTables } from "@/components/leaderboard-tables"
import { motion } from "framer-motion"

export default function LeaderboardPage() {
  return (
    <main className="flex-1 flex flex-col pt-24">
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="container relative">
          <motion.div 
            className="mb-8 text-center"
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
      </div>
    </main>
  )
} 
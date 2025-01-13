import { AgentTable } from '@/components/agent-table'
import { TopAgents } from '@/components/top-agents'
import { dummyAgents } from '@/lib/dummy-data'

export default function HomePage() {
  // Filter top 5 agents for each type
  const topLeftCurve = dummyAgents
    .filter(agent => agent.type === 'leftcurve')
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const topRightCurve = dummyAgents
    .filter(agent => agent.type === 'rightcurve')
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-7xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-sketch mb-8">Trading Agents</h1>
        <div className="mb-8">
          <p className="text-lg text-gray-600">
            Welcome to LeftCurve! Discover and invest in unique trading agents powered by memes and AI.
          </p>
        </div>
        
        <TopAgents leftCurveAgents={topLeftCurve} rightCurveAgents={topRightCurve} />
        
        <AgentTable agents={dummyAgents} />
      </div>
    </main>
  )
}

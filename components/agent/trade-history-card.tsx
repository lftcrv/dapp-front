import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TradeHistory } from '@/components/trade-history'

interface TradeHistoryCardProps {
  agentId: string
}

export function TradeHistoryCard({ agentId }: TradeHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-mono">Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        <TradeHistory agentId={agentId} />
      </CardContent>
    </Card>
  )
} 
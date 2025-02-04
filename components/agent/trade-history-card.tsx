import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradeHistory } from '@/components/trade-history';
import { useTrades } from '@/hooks/use-trades';
import { Trade } from '@/lib/types';

interface TradeHistoryCardProps {
  agentId: string;
  initialTrades?: Trade[];
}

export function TradeHistoryCard({ agentId, initialTrades = [] }: TradeHistoryCardProps) {
  // Pass initial trades to the hook
  const { trades, isLoading } = useTrades({ 
    agentId,
    initialData: initialTrades
  });

  const displayTrades = trades || initialTrades;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        <TradeHistory trades={displayTrades} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

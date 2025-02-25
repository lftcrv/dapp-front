'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TradeHistory } from '@/components/trade-history';
import { useTrades } from '@/hooks/use-trades';
import { Trade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';

interface TradeHistoryCardProps {
  agentId: string;
  initialTrades?: Trade[];
}

export function TradeHistoryCard({
  agentId,
  initialTrades = [],
}: TradeHistoryCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the trades hook
  const { trades, isLoading, error, refreshTrades, hasMore, loadMore } =
    useTrades({
      agentId,
      initialData: initialTrades,
      enabled: true,
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTrades();
    setIsRefreshing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trade History</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCcw
            className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <TradeHistory
          trades={trades || initialTrades}
          isLoading={isLoading || isRefreshing}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </CardContent>
    </Card>
  );
}

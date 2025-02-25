'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trade } from '@/lib/types';
import { TradeHistoryCard } from './trade-history-card';
import { tradeService } from '@/lib/services/api/trades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AgentTrades() {
  const params = useParams();
  const agentId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);
  const [initialTrades, setInitialTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await tradeService.getByAgent(agentId);
      console.log("result:", result)

      if (result.success && result.data) {
        setInitialTrades(result.data);
      } else {
        setError(
          typeof result.error === 'string'
            ? result.error
            : 'Failed to fetch trades',
        );
      }
    } catch (err) {
      setError('An error occurred while fetching trades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchInitialTrades();
    }
  }, [agentId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <RefreshCcw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading trade history...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <Alert>Error</Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchInitialTrades}>
                <RefreshCcw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <TradeHistoryCard agentId={agentId} initialTrades={initialTrades} />;
}

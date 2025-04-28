'use client';

import { Trade } from '@/lib/types';
import { TradeHistoryCard } from './trade-history-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define props interface
interface AgentTradesProps {
  agentId: string;
  trades: Trade[];
}

export default function AgentTrades({ agentId, trades }: AgentTradesProps) {
  return <TradeHistoryCard agentId={agentId} initialTrades={trades} />;
}

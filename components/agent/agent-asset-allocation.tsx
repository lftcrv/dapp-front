'use client';

import { useState, useEffect } from 'react';
import { getAssetAllocation } from '@/actions/agents/portfolio/getAssetAllocation';
import { getAssetColor } from '@/lib/utils/asset-colors';
import PortfolioAllocation from '@/components/agent/portfolio-allocation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type FormattedAllocationItem = {
  asset: string;
  value: number;
  percentage: number;
  color: string;
};

interface AgentAssetAllocationProps {
  agentId: string;
}

export default function AgentAssetAllocation({
  agentId,
}: AgentAssetAllocationProps) {
  const [allocation, setAllocation] = useState<
    FormattedAllocationItem[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllocationData() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getAssetAllocation(agentId);

        if (!result.success || !result.data) {
          setError(result.error || 'Failed to fetch asset allocation data');
          setAllocation(null);
          return;
        }

        // Transform the data to the format expected by PortfolioAllocation
        const formattedAllocation = result.data.assets.map((asset) => ({
          asset: asset.symbol,
          value: asset.value,
          percentage: asset.percentage,
          color: getAssetColor(asset.symbol),
        }));

        // Sort by value, descending
        formattedAllocation.sort((a, b) => b.value - a.value);

        setAllocation(formattedAllocation);
      } catch (err) {
        console.error('Error fetching asset allocation:', err);
        setError('An error occurred while fetching asset allocation');
        setAllocation(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (agentId) {
      fetchAllocationData();
    }
  }, [agentId]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Current distribution of assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Current distribution of assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!allocation || allocation.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Current distribution of assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            No asset allocation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Data loaded successfully
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Current distribution of assets</CardDescription>
      </CardHeader>
      <CardContent>
        <PortfolioAllocation allocation={allocation} />
      </CardContent>
    </Card>
  );
}

import { ProtocolFeesData } from '@/lib/types';
import { SingletonService } from '@/lib/core/service';
import { withErrorHandling, Result } from '@/lib/core/error-handler';
import protocolFeesData from '@/data/protocol-fees.json';

export class ProtocolFeesService extends SingletonService<ProtocolFeesData> {
  async getData(): Promise<Result<ProtocolFeesData>> {
    return withErrorHandling(async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return protocolFeesData as ProtocolFeesData;
    }, 'Failed to fetch protocol fees');
  }

  async claimRewards(address: string): Promise<Result<{ claimed: string }>> {
    return withErrorHandling(async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const data = protocolFeesData as ProtocolFeesData;
      return {
        claimed: data.userShares[address] || '0',
      };
    }, 'Failed to claim rewards');
  }
}

export const protocolFeesService = new ProtocolFeesService();

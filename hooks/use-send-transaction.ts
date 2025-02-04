import { useCallback, useEffect, useState } from 'react';
import { useSendTransaction as useStarknetSendTransaction } from '@starknet-react/core';

export interface TransactionCall {
  contractAddress: `0x${string}`;
  entrypoint: string;
  calldata: string[]; // Starknet contract calls use strings for calldata
}

interface SendTransactionOptions {
  calls: TransactionCall[];
}

export function useSendTransaction({ calls }: SendTransactionOptions) {
  const [preparedCalls, setPreparedCalls] = useState<TransactionCall[] | undefined>(undefined);

  // Update prepared calls when calls prop changes
  useEffect(() => {
    setPreparedCalls(calls && calls.length > 0 ? calls : undefined);
  }, [calls]);

  // Use the Starknet React hook with prepared calls
  const { sendAsync } = useStarknetSendTransaction({
    calls: preparedCalls
  });

  const execute = useCallback(async () => {
    if (!preparedCalls || preparedCalls.length === 0) {
      throw new Error('No transaction calls provided');
    }

    try {
      const response = await sendAsync();
      return response;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [preparedCalls, sendAsync]);

  return { sendTransaction: execute };
} 
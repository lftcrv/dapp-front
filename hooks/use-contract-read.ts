import { useReadContract } from '@starknet-react/core';
import type { Abi } from 'starknet';

interface UseContractReadProps {
  abi?: Abi;
  address?: `0x${string}`;
  functionName: string;
  args?: any[];
  watch?: boolean;
}

export function useContractRead({
  abi,
  address,
  functionName,
  args = [],
  watch = false
}: UseContractReadProps) {
  const { 
    data, 
    error, 
    isLoading,
    refetch
  } = useReadContract({
    abi,
    address,
    functionName,
    args,
    watch,
    enabled: !!abi && !!address,
  });

  return {
    data,
    error,
    isLoading,
    refetch
  };
} 
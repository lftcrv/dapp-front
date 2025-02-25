import { Contract, ProviderInterface, RpcProvider, num } from 'starknet';
import type { Abi } from 'starknet';
import { useState, useEffect } from 'react';
import { useProvider } from '@starknet-react/core';
import { useAccount } from '@starknet-react/core';

export async function fetchAbi(provider: ProviderInterface, address: string) {
  if (!address || address === '0x' || address === '0x0') {
    console.log('No valid address provided for ABI fetch');
    return undefined;
  }

  let result;
  try {
    result = await provider.getClassAt(address);
  } catch (e) {
    console.error('Failed to fetch contract class:', e);
    return undefined;
  }

  if (!result) {
    console.error('No result from provider');
    return undefined;
  }

  if (!result.abi) {
    console.error('No ABI in result:', result);
    return undefined;
  }

  const abiResult = result.abi;
  const isProxy = abiResult.some((func) => func.name === '__default__');

  if (!isProxy) {
    console.log('Not a proxy contract, returning ABI directly');
    return abiResult;
  }

  const proxyContract = new Contract(abiResult, address, provider);
  const possibleImplementationFunctionNames = [
    'implementation',
    'getImplementation',
    'get_implementation',
  ];
  const matchingFunctionName = possibleImplementationFunctionNames.find(
    (name) => proxyContract[name] && typeof proxyContract[name] === 'function',
  );

  if (matchingFunctionName === undefined) {
    console.error('No implementation function found in proxy contract');
    return undefined;
  }

  try {
    const implementationResult = await proxyContract[matchingFunctionName]();

    if (!implementationResult) {
      console.error('No implementation result');
      return undefined;
    }

    const {
      implementation,
      address: implementation_address,
      implementation_hash_,
    } = implementationResult;

    const hasImplementation = [
      implementation,
      implementation_address,
      implementation_hash_,
    ].find((variable) => variable !== undefined);

    if (hasImplementation === undefined) {
      console.error('No implementation address found in result');
      return undefined;
    }

    const implementationAddress = num.toHex(hasImplementation);

    try {
      const compiledContract = await provider.getClassByHash(
        implementationAddress,
      );
      if (!compiledContract || !compiledContract.abi) {
        console.error('No ABI found in implementation contract');
        return undefined;
      }
      return compiledContract.abi;
    } catch (e) {
      console.error('Failed to fetch implementation contract:', e);
      return undefined;
    }
  } catch (e) {
    console.error('Failed to call implementation function:', e);
    return undefined;
  }
}

export function useContractAbi(address: string) {
  const provider = new RpcProvider({
    nodeUrl:
      process.env.STARKNET_RPC_URL ||
      'https://starknet-sepolia.public.blastapi.io',
  });
  const { isConnected } = useAccount();
  const [abi, setAbi] = useState<Abi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state when disconnected or invalid address
    if (!isConnected || !address || address === '0x0' || address === '0x') {
      setAbi(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Only proceed if we have both provider and are connected
    if (!provider) {
      setError('Provider not available');
      setAbi(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const result = await fetchAbi(provider, address);
        if (!mounted) return;

        if (!result) {
          setError('Contract ABI not available');
          setAbi(null);
        } else {
          setError(null);
          setAbi(result);
        }
      } catch (e) {
        if (!mounted) return;
        console.error('Error loading contract ABI:', e);
        setError('Failed to load contract ABI');
        setAbi(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [address, provider, isConnected]);

  return { abi, error, isLoading };
}

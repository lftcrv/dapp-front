import { Contract, ProviderInterface, RpcProvider, num } from 'starknet';
import type { Abi } from 'starknet';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useProvider } from '@starknet-react/core';

// First, define proper TypeScript declarations for window extensions
declare global {
  interface Window {
    _abiCache?: Record<string, any>;
    _abiCheckedAddresses?: Record<string, boolean>;
  }
}

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
    // Reduced logging to once per session for this address
    if (!window._abiCheckedAddresses) window._abiCheckedAddresses = {};
    if (!window._abiCheckedAddresses[address]) {
      console.log('Not a proxy contract, returning ABI directly');
      window._abiCheckedAddresses[address] = true;
    }
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

export function useContractAbi(address: string, forceLocalAbi = false) {
  // Use the provider from context instead of creating a new one
  const { provider: contextProvider } = useProvider();
  const { isConnected } = useAccount();
  const [abi, setAbi] = useState<Abi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchRequested, setFetchRequested] = useState(false);
  const [startTime] = useState<number>(Date.now()); // Track when loading started

  // Fallback provider if context provider is not available
  const fallbackProvider = useMemo(() => {
    return new RpcProvider({
      nodeUrl:
        process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
        'https://starknet-sepolia.public.blastapi.io',
    });
  }, []);

  // Use context provider or fallback
  const provider = useMemo(() => {
    return contextProvider || fallbackProvider;
  }, [contextProvider, fallbackProvider]);

  // Mémorise l'adresse normalisée pour éviter des re-rendus inutiles
  const normalizedAddress = useMemo(() => {
    if (!address || address === '0x' || address === '0x0') {
      return null;
    }
    return address.toLowerCase();
  }, [address]);

  // Cache ABIs in session to avoid repeated fetches
  const cacheKey = useMemo(() => {
    return normalizedAddress ? `abi-${normalizedAddress}` : null;
  }, [normalizedAddress]);

  // Add timeout handling
  useEffect(() => {
    if (!isLoading || forceLocalAbi) return;

    const timeoutId = setTimeout(() => {
      console.warn(
        `[useContractAbi] ABI loading timed out for ${normalizedAddress}`,
      );
      setError('ABI loading timed out');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, normalizedAddress, forceLocalAbi]);

  // Check cache first
  useEffect(() => {
    if (!cacheKey || !normalizedAddress || forceLocalAbi) return;

    // Try to get from memory cache first
    if (!window._abiCache) window._abiCache = {};

    if (window._abiCache[cacheKey]) {
      setAbi(window._abiCache[cacheKey]);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Request a fetch
    setFetchRequested(true);
  }, [cacheKey, normalizedAddress, forceLocalAbi]);

  // Main effect to fetch ABI
  useEffect(() => {
    // Skip if force local ABI is set
    if (forceLocalAbi) {
      setAbi(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Only proceed if fetch is requested
    if (!fetchRequested) return;

    // Reset fetch requested flag
    setFetchRequested(false);

    // Reset state when disconnected or invalid address
    if (!isConnected || !normalizedAddress) {
      setAbi(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Only proceed if provider is available
    if (!provider) {
      setError('Provider not available');
      setAbi(null);
      setIsLoading(false);
      return;
    }

    // Avoid multiple concurrent fetches for the same address
    if (isLoading) return;

    let mounted = true;
    setIsLoading(true);
    console.log(`[useContractAbi] Starting ABI fetch for ${normalizedAddress}`);

    const load = async () => {
      try {
        const result = await fetchAbi(provider, normalizedAddress);
        if (!mounted) return;

        if (!result) {
          console.log(
            `[useContractAbi] No ABI result for ${normalizedAddress}`,
          );
          setError('Contract ABI not available');
          setAbi(null);
        } else {
          console.log(
            `[useContractAbi] ABI fetch successful for ${normalizedAddress}`,
          );
          // Cache the result
          if (!window._abiCache) window._abiCache = {};
          window._abiCache[cacheKey!] = result;

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
  }, [
    forceLocalAbi,
    fetchRequested,
    normalizedAddress,
    isConnected,
    provider,
    isLoading,
    cacheKey,
  ]);

  // Calculate if a timeout has occurred based on time elapsed
  const hasTimedOut = useMemo(() => {
    return isLoading && Date.now() - startTime > 10000;
  }, [isLoading, startTime]);

  return { abi, error, isLoading, hasTimedOut };
}

import { Contract, ProviderInterface, num } from 'starknet';
import type { Abi } from 'starknet';
import { useState, useEffect } from 'react';
import { useProvider } from '@starknet-react/core';

export async function fetchAbi(provider: ProviderInterface, address: string) {
  if (!address || address === '0x' || address === '0x0') {
    console.log('No valid address provided for ABI fetch');
    return undefined;
  }

  let result;
  try {
    console.log('Attempting to fetch class at address:', address);
    result = await provider.getClassAt(address);
  } catch (e) {
    console.error('Failed to getClassAt:', e);
    try {
      console.log('Attempting to fetch class by hash:', address);
      result = await provider.getClassByHash(address);
    } catch (e) {
      console.error('Failed to getClassByHash:', e);
      return undefined;
    }
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
  const isProxy = abiResult.some((func) => (func.name === '__default__'));

  if (!isProxy) {
    console.log('Not a proxy contract, returning ABI directly');
    return abiResult;
  }
  
  console.log('Detected proxy contract, fetching implementation');
  const proxyContract = new Contract(abiResult, address, provider);
  const possibleImplementationFunctionNames = ["implementation", "getImplementation", "get_implementation"];
  const matchingFunctionName = possibleImplementationFunctionNames.find(
    name => proxyContract[name] && typeof proxyContract[name] === "function"
  );
  
  if (matchingFunctionName === undefined) {
    console.error('No implementation function found in proxy contract');
    return undefined;
  }

  try {
    console.log('Calling implementation function:', matchingFunctionName);
    const implementationResult = await proxyContract[matchingFunctionName]();
    console.log('Implementation result:', implementationResult);

    if (!implementationResult) {
      console.error('No implementation result');
      return undefined;
    }

    const { implementation, address: implementation_address, implementation_hash_ } = implementationResult;
    
    const hasImplementation = [implementation, implementation_address, implementation_hash_]
      .find(variable => variable !== undefined);

    if (hasImplementation === undefined) {
      console.error('No implementation address found in result');
      return undefined;
    }

    const implementationAddress = num.toHex(hasImplementation);
    console.log('Fetching implementation ABI from address:', implementationAddress);
    
    try {
      const compiledContract = await provider.getClassByHash(implementationAddress);
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
  const { provider } = useProvider();
  const [abi, setAbi] = useState<Abi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address || !provider) {
      setIsLoading(false);
      setAbi(null);
      setError(null);
      return;
    }

    let mounted = true;
    
    const load = async () => {
      try {
        console.log('Starting ABI fetch for address:', address);
        const result = await fetchAbi(provider, address);
        if (!mounted) return;
        
        if (!result) {
          console.error('No ABI result for address:', address);
          setError('Failed to fetch ABI');
          setAbi(null);
        } else {
          console.log('Successfully fetched ABI for address:', address);
          setError(null);
          setAbi(result);
        }
      } catch (e) {
        if (!mounted) return;
        console.error('Error in useContractAbi:', e);
        setError('Failed to fetch ABI');
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
  }, [address, provider]);

  return { abi, error, isLoading };
} 
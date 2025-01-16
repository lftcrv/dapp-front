import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { hash, ec, num } from 'starknet';

// Constants
const SHA256_EC_MAX_DIGEST = BigInt(2 ** 256);
const EC_ORDER = BigInt("3618502788666131213697322783095070105623107215331596699973092056135872020481");

// Helper functions
const paddedHex = (x: bigint): string => {
  const hex = x.toString(16);
  return hex.length % 2 === 0 ? hex : '0' + hex;
};

const indexedSha256 = (seed: bigint, index: bigint): bigint => {
  const message = paddedHex(seed) + paddedHex(index);
  const hash = ethers.utils.sha256('0x' + message);
  return BigInt(hash);
};

const grindKey = (keySeed: bigint, keyValueLimit: bigint): bigint => {
  const maxAllowedValue = SHA256_EC_MAX_DIGEST - (SHA256_EC_MAX_DIGEST % keyValueLimit);
  let currentIndex = BigInt(0);

  let key = indexedSha256(keySeed, currentIndex);
  while (key >= maxAllowedValue) {
    currentIndex += BigInt(1);
    key = indexedSha256(keySeed, currentIndex);
  }

  return key % keyValueLimit;
};

// Typed data for Starknet key derivation
const starkKeyTypedData = {
  domain: {
    name: 'LeftCurve',
    version: '1',
    chainId: '0x534e5f4d41494e', // SN_MAIN
  },
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'string' },
    ],
    StarknetKey: [
      { name: 'derivation', type: 'string' },
    ],
  },
  primaryType: 'StarknetKey',
  message: {
    derivation: 'starknet_key',
  },
};

export interface StarknetAccount {
  privateKey: bigint;
  publicKey: string;
  address: string;
}

export async function deriveStarknetAccount(signer: ethers.providers.JsonRpcSigner): Promise<StarknetAccount> {
  try {
    // Get EVM signature using ethers v5 format
    const signature = await signer._signTypedData(
      starkKeyTypedData.domain,
      { StarknetKey: starkKeyTypedData.types.StarknetKey },
      starkKeyTypedData.message
    );

    // Extract r value from signature (first 32 bytes)
    const r = BigInt('0x' + signature.slice(2, 66));
    
    // Derive Starknet private key
    const privateKey = grindKey(r, EC_ORDER);
    
    // Get public key using starknet.js
    const publicKeyHex = num.toHex(privateKey);
    const publicKey = ec.starkCurve.getPublicKey(publicKeyHex);
    
    // Convert public key to hex string
    const publicKeyStr = num.toHex(publicKey);
    
    // Compute Starknet address
    const constructorCallData = [publicKeyStr];
    const address = hash.calculateContractAddressFromHash(
      publicKeyStr,
      hash.getSelectorFromName('initialize'),
      constructorCallData,
      0 // Optional salt
    );

    return {
      privateKey,
      publicKey: publicKeyStr,
      address,
    };
  } catch (error) {
    console.error('Failed to derive Starknet account:', error);
    throw error;
  }
}

// Hook for managing Starknet account derivation
export function useStarknetDerivation(evmSigner?: ethers.providers.JsonRpcSigner | null) {
  const [derivedAccount, setDerivedAccount] = useState<StarknetAccount | null>(null);
  const [isDerivingAccount, setIsDerivingAccount] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deriveAccount = useCallback(async () => {
    if (!evmSigner) return;

    try {
      setIsDerivingAccount(true);
      setError(null);
      const account = await deriveStarknetAccount(evmSigner);
      setDerivedAccount(account);
      
      // Store derived account in localStorage
      localStorage.setItem('derived_starknet_account', JSON.stringify({
        address: account.address,
        publicKey: account.publicKey,
      }));
      
      return account;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to derive account'));
      throw err;
    } finally {
      setIsDerivingAccount(false);
    }
  }, [evmSigner]);

  return {
    derivedAccount,
    isDerivingAccount,
    error,
    deriveAccount,
  };
} 
import { useCallback } from 'react';
import { useContract, useAccount, useProvider, useSendTransaction } from '@starknet-react/core';
import type { Abi } from 'starknet';

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    inputs: [
      {
        name: "spender",
        type: "felt"
      },
      {
        name: "amount",
        type: "Uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        type: "felt"
      }
    ],
    state_mutability: "external",
    type: "function"
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256"
      }
    ],
    state_mutability: "view",
    type: "function"
  }
] as Abi;

interface UseTokenTransactionProps {
  address?: string;
  abi?: Abi;
}

export function useBuyTokens({ address, abi }: UseTokenTransactionProps) {
  const { contract } = useContract({
    abi,
    address: address as `0x${string}`,
  });

  const { contract: ethToken } = useContract({
    address: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI
  });

  const { account } = useAccount();
  const { provider } = useProvider();
  const { sendAsync } = useSendTransaction({ calls: [] });

  const execute = useCallback(async (amountInWei: string) => {
    console.log('🔍 Contract Status:', {
      agentContract: !!contract,
      agentAbi: !!abi,
      ethContract: !!ethToken,
      ethAbi: !!ERC20_ABI,
      wallet: !!account
    });

    if (!contract || !address || !ethToken) {
      throw new Error('Contract not initialized');
    }

    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountBN = BigInt(amountInWei);
      console.log('💱 Amount to spend:', amountBN.toString());

      // Prepare approve call
      console.log('📝 Preparing approve call...');
      const approveCall = await ethToken.populate("approve", [
        address, // spender address
        amountBN.toString() // amount as string
      ]);
      
      console.log('✅ Approve call prepared:', {
        contractAddress: approveCall.contractAddress,
        entrypoint: approveCall.entrypoint,
        calldata: approveCall.calldata,
        args: [address, amountBN.toString()]
      });

      // Send approve transaction
      console.log('👉 Sending approve transaction...');
      const approveTx = await sendAsync([approveCall]);
      console.log('✅ Approval sent:', approveTx);

      // Wait for approval confirmation
      console.log('⏳ Waiting for approval confirmation...');
      await provider.waitForTransaction(approveTx.transaction_hash);
      console.log('✅ Approval confirmed:', approveTx.transaction_hash);

      // Prepare buy call
      console.log('📝 Preparing buy call...');
      const buyCall = await contract.populate('buy', [
        amountBN.toString() // amount as string
      ]);
      console.log('✅ Buy call prepared:', {
        contractAddress: buyCall.contractAddress,
        entrypoint: buyCall.entrypoint,
        calldata: buyCall.calldata,
        args: [amountBN.toString()]
      });

      // Send buy transaction
      console.log('👉 Sending buy transaction...');
      const buyTx = await sendAsync([buyCall]);
      console.log('✅ Buy transaction sent:', buyTx);

      // Wait for buy confirmation
      await provider.waitForTransaction(buyTx.transaction_hash);
      console.log('✅ Buy confirmed:', buyTx.transaction_hash);
      
      return buyTx;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }, [contract, address, account, ethToken, provider, sendAsync, abi]);

  return {
    buyTokens: execute,
  };
}

export function useSellTokens({ address, abi }: UseTokenTransactionProps) {
  const { contract } = useContract({
    abi,
    address: address as `0x${string}`,
  });
  const { account, address: accountAddress, status } = useAccount();

  const execute = useCallback(async (amountInWei: string) => {
    console.log('Sell Transaction - Wallet Status:', {
      hasAccount: !!account,
      accountAddress,
      connectionStatus: status,
      hasContract: !!contract,
      contractAddress: address
    });

    if (!contract || !address) {
      throw new Error('Contract not initialized');
    }

    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountBN = BigInt(amountInWei);
      console.log('Executing sell with amount:', amountBN.toString());
      
      // Convert to Uint256 array format
      const amountLow = amountBN & ((1n << 128n) - 1n);
      const amountHigh = amountBN >> 128n;
      
      console.log('Amount components:', {
        original: amountBN.toString(),
        lowDec: amountLow.toString(),
        highDec: amountHigh.toString(),
        lowHex: amountLow.toString(16),
        highHex: amountHigh.toString(16)
      });
      
      const call = await contract.populate('sell', [
        '0x' + amountLow.toString(16),
        '0x' + amountHigh.toString(16)
      ]);
      
      console.log('Sell call details:', {
        entrypoint: call.entrypoint,
        calldata: call.calldata
      });
      
      const response = await account.execute({
        contractAddress: address,
        entrypoint: call.entrypoint,
        calldata: call.calldata
      });
      return response;
    } catch (error) {
      console.error('Sell transaction failed:', error);
      throw error;
    }
  }, [contract, address, account, accountAddress, status]);

  return {
    sellTokens: execute,
  };
} 
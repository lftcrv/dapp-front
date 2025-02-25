'use server';

import { RpcProvider, Account, CallData, ec, hash, encode } from 'starknet';
import { signatureStorage } from './derive-starknet-account';
import { deriveStarkKeyFromSignature } from './derive-starknet-account';
import { OZ_ACCOUNT_CLASS_HASH, DEFAULT_NODE_URL } from './starknet-constants';

// Types for transaction results
export interface TransactionResult {
  success: boolean;
  error?: string;
  txHash?: string;
  accountAddress?: string;
}

// Types for transaction preparation
export interface PreparedTransaction {
  accountAddress: string;
  privateKey?: string;
  calldata: any;
  contractAddress: string;
  entrypoint: string;
  estimatedFee?: string;
}

/**
 * Get the Starknet account address from a private key
 */
export async function getAccountAddress(privateKey: string): Promise<string> {
  try {
    // Calculate the public key from the private key
    const starkKeyPub = ec.starkCurve.getPublicKey(privateKey);

    // For Starknet, we need just the x-coordinate of the public key
    const publicKeyHex = encode.buf2hex(starkKeyPub);

    // Extract the x-coordinate
    const xCoordinate = publicKeyHex.startsWith('0x')
      ? publicKeyHex.slice(4, 4 + 64)
      : publicKeyHex.slice(2, 2 + 64);

    // Format the x-coordinate with 0x prefix
    const formattedPublicKey = `0x${xCoordinate}`;

    // Convert to BigInt
    const publicKeyBigInt = BigInt(formattedPublicKey);

    // Create constructor calldata with the public key
    const constructorCalldata = CallData.compile({
      publicKey: publicKeyBigInt.toString(),
    });

    // Calculate the contract address
    const address = hash.calculateContractAddressFromHash(
      publicKeyBigInt, // salt
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0, // deployer address
    );

    // Format the address with 0x prefix
    return '0x' + BigInt(address).toString(16);
  } catch (error) {
    console.error(
      '[Starknet Transaction Error]: Failed to get account address',
      error,
    );
    throw error;
  }
}

/**
 * Check if a Starknet account has sufficient balance for a transaction
 */
export async function checkAccountBalance(
  accountAddress: string,
  requiredBalance: bigint = 0n,
): Promise<{ hasBalance: boolean; balance: bigint }> {
  try {
    console.log('[Starknet Transaction]: Checking account balance', {
      accountAddress,
      requiredBalance: requiredBalance.toString(),
    });

    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: DEFAULT_NODE_URL });

    // ETH token address
    const tokenAddress =
      '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';

    // Check balance
    const balanceResult = await provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: 'balanceOf',
      calldata: [accountAddress],
    });

    if (balanceResult && balanceResult.length >= 2) {
      const low = BigInt(balanceResult[0]);
      const high = BigInt(balanceResult[1]);
      const balance = (high << 128n) + low;

      console.log(
        `[Starknet Transaction]: Account balance: ${balance.toString()} wei (${
          Number(balance) / 10 ** 18
        } ETH)`,
      );

      return {
        hasBalance: balance >= requiredBalance,
        balance,
      };
    }

    return { hasBalance: false, balance: 0n };
  } catch (error) {
    console.error(
      '[Starknet Transaction Error]: Failed to check account balance',
      error,
    );
    return { hasBalance: false, balance: 0n };
  }
}

/**
 * Prepare an approval transaction without executing it
 */
export async function prepareApproval(
  accountAddressOrPrivateKey: string,
  spenderAddress: string,
  tokenAddress: string,
  tokenAmount: string,
  isPrivateKey: boolean = false,
): Promise<PreparedTransaction | null> {
  try {
    console.log('[Starknet Transaction]: Preparing approval transaction', {
      spenderAddress,
      tokenAddress,
      tokenAmount,
      isPrivateKey,
    });

    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: DEFAULT_NODE_URL });

    // Get account address
    let accountAddress: string;
    let privateKey: string | undefined;

    if (isPrivateKey) {
      privateKey = accountAddressOrPrivateKey;
      accountAddress = await getAccountAddress(privateKey);
    } else {
      accountAddress = accountAddressOrPrivateKey;
    }

    console.log(
      `[Starknet Transaction]: Using account address: ${accountAddress}`,
    );

    // Check if account exists
    try {
      const accountClassHash = await provider.getClassHashAt(accountAddress);
      console.log(
        `[Starknet Transaction]: Account exists with class hash: ${accountClassHash}`,
      );
    } catch {
      console.error('[Starknet Transaction Error]: Account not deployed');
      return null;
    }

    // Initialize account (if we have the private key)
    let account: Account | null = null;
    if (privateKey) {
      account = new Account(provider, accountAddress, privateKey);
    }

    // Convert amount to uint256
    const amountLow = tokenAmount;
    const amountHigh = '0';

    // Prepare calldata
    const calldata = [spenderAddress, amountLow, amountHigh];

    // Estimate fee if we have the account
    let estimatedFee: string | undefined;
    if (account) {
      try {
        const { suggestedMaxFee } = await account.estimateInvokeFee({
          contractAddress: tokenAddress,
          entrypoint: 'approve',
          calldata,
        });
        estimatedFee = suggestedMaxFee.toString();
        console.log(
          `[Starknet Transaction]: Estimated fee: ${estimatedFee} wei`,
        );
      } catch (error) {
        console.warn(
          '[Starknet Transaction Warning]: Failed to estimate fee',
          error,
        );
      }
    }

    return {
      accountAddress,
      privateKey,
      calldata,
      contractAddress: tokenAddress,
      entrypoint: 'approve',
      estimatedFee,
    };
  } catch (error) {
    console.error(
      '[Starknet Transaction Error]: Failed to prepare approval',
      error,
    );
    return null;
  }
}

/**
 * Execute an approval transaction using a private key
 */
export async function executeApprovalWithPrivateKey(
  preparedTx: PreparedTransaction,
): Promise<TransactionResult> {
  try {
    console.log('[Starknet Transaction]: Executing approval with private key');

    if (!preparedTx.privateKey) {
      return {
        success: false,
        error: 'Private key is required for this operation',
      };
    }

    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: DEFAULT_NODE_URL });

    // Initialize account
    const account = new Account(
      provider,
      preparedTx.accountAddress,
      preparedTx.privateKey,
    );

    // Execute the transaction
    const { transaction_hash } = await account.execute({
      contractAddress: preparedTx.contractAddress,
      entrypoint: preparedTx.entrypoint,
      calldata: preparedTx.calldata,
    });

    console.log(
      `[Starknet Transaction]: Transaction sent: ${transaction_hash}`,
    );

    // Wait for transaction acceptance
    console.log(
      '[Starknet Transaction]: Waiting for transaction acceptance...',
    );
    await provider.waitForTransaction(transaction_hash);
    console.log('[Starknet Transaction]: Transaction accepted');

    return {
      success: true,
      txHash: transaction_hash,
      accountAddress: preparedTx.accountAddress,
    };
  } catch (error) {
    console.error(
      '[Starknet Transaction Error]: Failed to execute approval',
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      accountAddress: preparedTx.accountAddress,
    };
  }
}

/**
 * Approve tokens using a Starknet account derived from an EVM signature
 */
export async function approveWithEvmSignature(
  evmAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  tokenAmount: string,
): Promise<TransactionResult> {
  try {
    console.log('[Starknet Transaction]: Approving with EVM signature', {
      evmAddress,
      spenderAddress,
      tokenAddress,
      tokenAmount,
    });

    // Get the signature from storage
    const signature = await signatureStorage.getSignature(evmAddress);
    if (!signature) {
      return {
        success: false,
        error: 'No signature found for this EVM address',
      };
    }

    // Derive the private key from the signature
    const privateKey = deriveStarkKeyFromSignature(signature);

    // Get the account address
    const accountAddress = await getAccountAddress(privateKey);
    console.log(
      `[Starknet Transaction]: Derived account address: ${accountAddress}`,
    );

    // Check if account has sufficient balance
    const { hasBalance, balance } = await checkAccountBalance(accountAddress);
    if (!hasBalance || balance === 0n) {
      return {
        success: false,
        error: 'Account has insufficient balance',
        accountAddress,
      };
    }

    // Prepare the transaction
    const preparedTx = await prepareApproval(
      privateKey,
      spenderAddress,
      tokenAddress,
      tokenAmount,
      true, // isPrivateKey
    );

    if (!preparedTx) {
      return {
        success: false,
        error: 'Failed to prepare transaction',
        accountAddress,
      };
    }

    // Execute the transaction
    return await executeApprovalWithPrivateKey(preparedTx);
  } catch (error) {
    console.error(
      '[Starknet Transaction Error]: Failed to approve with EVM signature',
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unified function to approve tokens using either a native Starknet wallet or an EVM-derived wallet
 */
export async function approveTokens(
  walletType: 'starknet' | 'evm',
  walletAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  tokenAmount: string,
): Promise<TransactionResult> {
  console.log('[Starknet Transaction]: Approving tokens', {
    walletType,
    walletAddress,
    spenderAddress,
    tokenAddress,
    tokenAmount,
  });

  if (walletType === 'starknet') {
    // For native Starknet wallets, we return the transaction details
    // The actual approval will be handled by the frontend using the wallet's signing capabilities
    const preparedTx = await prepareApproval(
      walletAddress, // account address
      spenderAddress,
      tokenAddress,
      tokenAmount,
      false, // not a private key
    );

    if (!preparedTx) {
      return {
        success: false,
        error: 'Failed to prepare transaction',
      };
    }

    return {
      success: true,
      accountAddress: walletAddress,
      // We don't have a txHash yet since the transaction will be signed by the wallet
    };
  } else {
    // For EVM-derived wallets, we handle the approval using the derived private key
    return await approveWithEvmSignature(
      walletAddress,
      spenderAddress,
      tokenAddress,
      tokenAmount,
    );
  }
}

'use server';

import { Account, RpcProvider, uint256, Contract, CallData, hash, ec, encode } from 'starknet';
import { 
  OZ_ACCOUNT_CLASS_HASH, 
  STARKNET_CURVE_ORDER,
  DEFAULT_NODE_URL,
  DEPLOYMENT_AMOUNT,
  MAX_FEE
} from './starknet-constants';

// Environment variables
const ADMIN_WALLET_PK = process.env.ADMIN_WALLET_PK;
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS;
const ETH_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS;
const NODE_URL = DEFAULT_NODE_URL;

// DEBUG LOGS: Enable detailed logging for deployment process
const DEBUG = {
  log: (...args: any[]) => console.log('[Starknet Wallet]:', ...args),
  error: (...args: any[]) => console.error('[Starknet Wallet Error]:', ...args),
  wallet: (...args: any[]) => console.log('[Wallet Operation]:', ...args)
};

// Helper function to check if an account is already deployed
async function isAccountDeployed(provider: RpcProvider, address: string): Promise<boolean> {
  try {
    DEBUG.log(`Checking if account is deployed at address: ${address}`);
    const accountClassHash = await provider.getClassHashAt(address);
    DEBUG.log(`✅ Account already deployed with class hash: ${accountClassHash}`);
    return true;
  } catch (error) {
    DEBUG.log(`📊 Account not deployed yet at address: ${address}`);
    return false;
  }
}

// Deploy a Starknet account using the same approach as the test script
export async function deployStarknetWallet(privateKey: string): Promise<{ 
  success: boolean; 
  address?: string; 
  txHash?: string; 
  error?: string;
}> {
  try {
    DEBUG.log('🔄 Starting Starknet wallet deployment...');
    DEBUG.log(`🌐 Connecting to node: ${NODE_URL}`);
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Ensure the private key is properly formatted
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    DEBUG.log(`🔑 Using private key: ${formattedPrivateKey.slice(0, 10)}...${formattedPrivateKey.slice(-10)}`);
    
    // Calculate the public key from the private key
    const starkKeyPub = ec.starkCurve.getPublicKey(formattedPrivateKey);
    const publicKeyHex = encode.buf2hex(starkKeyPub);
    DEBUG.log(`Raw public key: ${publicKeyHex}`);
    
    // Extract the x-coordinate (remove the '04' prefix and take the first half)
    const xCoordinate = publicKeyHex.startsWith('0x') 
      ? publicKeyHex.slice(4, 4 + 64) 
      : publicKeyHex.slice(2, 2 + 64);
    
    // Format the x-coordinate with 0x prefix
    const formattedPublicKey = `0x${xCoordinate}`;
    DEBUG.log(`Formatted public key (x-coordinate): ${formattedPublicKey}`);
    
    // Convert to BigInt
    let publicKeyBigInt = BigInt(formattedPublicKey);
    DEBUG.log(`Public key as BigInt: ${publicKeyBigInt.toString()}`);
    
    // Check if the public key is too large
    const curveOrder = BigInt(STARKNET_CURVE_ORDER);
    if (publicKeyBigInt >= curveOrder) {
      DEBUG.log('⚠️ Public key is too large, applying modulo with curve order');
      publicKeyBigInt = publicKeyBigInt % curveOrder;
      DEBUG.log(`Adjusted public key: ${publicKeyBigInt.toString()}`);
    }

    // Create constructor calldata with the public key
    const constructorCalldata = CallData.compile({
      publicKey: publicKeyBigInt.toString()
    });
    DEBUG.log('Constructor calldata:', constructorCalldata);

    // Calculate the contract address
    const address = hash.calculateContractAddressFromHash(
      publicKeyBigInt, // salt
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0 // deployer address
    );
    
    // Format the address with 0x prefix
    const formattedAddress = `0x${BigInt(address).toString(16)}`;
    DEBUG.log('📝 Calculated account address:', formattedAddress);

    // Check if the account is already deployed
    const accountDeployed = await isAccountDeployed(provider, formattedAddress);
    if (accountDeployed) {
      DEBUG.log(`✅ Account already deployed at address: ${formattedAddress}`);
      DEBUG.log('- No need to deploy again');
      DEBUG.log(`- Class Hash: ${OZ_ACCOUNT_CLASS_HASH}`);
      DEBUG.log(`- Constructor Calldata: ${JSON.stringify(constructorCalldata)}`);
      DEBUG.log(`- Address Salt: ${publicKeyBigInt.toString()}`);
      DEBUG.log(`- Max Fee: ${MAX_FEE.toString()} (${Number(MAX_FEE) / 1e18} ETH)`);
      
      return {
        success: true,
        address: formattedAddress
      };
    }

    // Fund the account before deployment
    const fundingResult = await fundWallet(formattedAddress);
    if (!fundingResult.success) {
      throw new Error(`Failed to fund account: ${fundingResult.error}`);
    }

    // Create an account instance with the derived private key
    const account = new Account(
      provider,
      formattedAddress,
      formattedPrivateKey
    );

    // Deploy the account
    DEBUG.log('Deploying account...');
    DEBUG.log(`Account address: ${formattedAddress}`);
    DEBUG.log(`Setting max fee for deployment: ${MAX_FEE.toString()}`);
    
    // Log deployment parameters for debugging - match test script format
    DEBUG.log("Deployment parameters:", {
      classHash: OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      addressSalt: publicKeyBigInt.toString(),
      chainId: await provider.getChainId()
    });
    
    // Deploy the account using the exact same approach as the test script
    const deployResponse = await account.deployAccount({
      classHash: OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      addressSalt: publicKeyBigInt,
      maxFee: MAX_FEE
    } as any); // Type assertion is necessary due to starknet.js type definitions
    
    DEBUG.log('Account deployment transaction hash:', deployResponse.transaction_hash);
    
    // Wait for the transaction to be accepted
    DEBUG.log('⏳ Waiting for deployment transaction to be accepted...');
    await provider.waitForTransaction(deployResponse.transaction_hash);
    DEBUG.log('Account deployment successful!');
    
    DEBUG.log('🎉 Account deployed successfully!');
    DEBUG.log(`- Address: ${formattedAddress}`);
    DEBUG.log(`- Transaction hash: ${deployResponse.transaction_hash}`);

    return {
      success: true,
      address: formattedAddress,
      txHash: deployResponse.transaction_hash
    };
  } catch (error) {
    DEBUG.error('❌ Error deploying Starknet wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Fund a wallet with ETH for deployment
export async function fundWallet(recipientAddress: string): Promise<{ 
  success: boolean; 
  txHash?: string; 
  error?: string;
}> {
  try {
    DEBUG.wallet('💰 Funding account', recipientAddress, 'with', DEPLOYMENT_AMOUNT.toString(), 'wei...');
    
    // Validate environment variables
    if (!ADMIN_WALLET_PK || !ADMIN_WALLET_ADDRESS) {
      throw new Error('Admin wallet not configured');
    }
    
    if (!ETH_TOKEN_ADDRESS) {
      throw new Error('ETH token address not configured');
    }
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Initialize admin account
    const adminAccount = new Account(provider, ADMIN_WALLET_ADDRESS, ADMIN_WALLET_PK);
    
    // Prepare transfer call
    const amountUint256 = uint256.bnToUint256(DEPLOYMENT_AMOUNT);
    
    // Execute transfer
    const { transaction_hash } = await adminAccount.execute({
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: 'transfer',
      calldata: [
        recipientAddress,
        amountUint256.low.toString(),
        amountUint256.high.toString()
      ]
    });
    DEBUG.wallet('💸 Funding transaction sent:', transaction_hash);

    // Wait for transaction acceptance
    await provider.waitForTransaction(transaction_hash);
    DEBUG.wallet('✅ Funding transaction accepted');

    return {
      success: true,
      txHash: transaction_hash
    };
  } catch (error) {
    DEBUG.error('❌ Failed to fund wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Combined function to fund and deploy a wallet in one step
export async function fundAndDeployWallet(privateKey: string): Promise<{ 
  success: boolean; 
  address?: string;
  txHash?: string; 
  error?: string;
}> {
  try {
    DEBUG.log('🔄 Starting combined fund and deploy operation...');
    
    // Deploy the wallet (includes funding)
    const deployResult = await deployStarknetWallet(privateKey);
    
    if (!deployResult.success) {
      throw new Error(deployResult.error || 'Unknown deployment error');
    }
    
    DEBUG.log('✅ Wallet funded and deployed successfully!');
    DEBUG.log(`- Address: ${deployResult.address}`);
    DEBUG.log(`- Transaction hash: ${deployResult.txHash}`);
    
    return {
      success: true,
      address: deployResult.address,
      txHash: deployResult.txHash
    };
  } catch (error) {
    DEBUG.error('❌ Failed to fund and deploy wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 
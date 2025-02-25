// Constants for Starknet account deployment
// This file contains shared constants used across different files

// Account class hash for OpenZeppelin Account implementation on Sepolia
export const OZ_ACCOUNT_CLASS_HASH =
  '0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f';

// Starknet curve order - used for key validation
export const STARKNET_CURVE_ORDER =
  '0x0800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f';

// Default node URL
export const DEFAULT_NODE_URL =
  process.env.NEXT_PUBLIC_NODE_URL || 'https://starknet-sepolia.public.blastapi.io';

// Constants for deployment
export const DEPLOYMENT_AMOUNT = 10000000000000000n; // 0.01 ETH in wei
export const MAX_FEE = 5000000000000000n; // 0.005 ETH for deployment 
export interface User {
  id: string;
  evmAddress?: string;
  starknetAddress?: string;
  name?: string;
  twitter?: string;
  lastConnection: string;
  createdAt: string;
  updatedAt: string;
  addressType: WalletAddressType;
  usedReferralCode?: string;
}

export enum WalletAddressType {
  NATIVE = 'NATIVE',
  DERIVED = 'DERIVED',
}
'use server';

/**
 * Server action to check if a wallet address has admin access
 */
export async function checkAdminAccessDirectly(privyWalletAddress?: string, starknetWalletAddress?: string) {
  try {
    // Get the authorized wallet addresses from environment variables
    const adminWalletAddresses = process.env.ADMIN_WALLET_ADDRESSES
      ? process.env.ADMIN_WALLET_ADDRESSES.split(',').map(addr => addr.trim().toLowerCase())
      : [];
    
    console.log('Server: Admin wallet addresses:', adminWalletAddresses);
    console.log('Server: Checking wallet addresses:', { 
      privyWalletAddress, 
      starknetWalletAddress 
    });
    
    // Check if either wallet address is in the list of authorized addresses
    const isAuthorized = adminWalletAddresses.some(addr => {
      // Try with and without 0x prefix
      const addrWithoutPrefix = addr.startsWith('0x') ? addr.slice(2) : addr;
      
      // Check Privy address
      if (privyWalletAddress) {
        const privyWithoutPrefix = privyWalletAddress.startsWith('0x') 
          ? privyWalletAddress.slice(2) 
          : privyWalletAddress;
          
        if (addr === privyWalletAddress || addrWithoutPrefix === privyWithoutPrefix) {
          return true;
        }
      }
      
      // Check Starknet address
      if (starknetWalletAddress) {
        const starknetWithoutPrefix = starknetWalletAddress.startsWith('0x') 
          ? starknetWalletAddress.slice(2) 
          : starknetWalletAddress;
          
        if (addr === starknetWalletAddress || addrWithoutPrefix === starknetWithoutPrefix) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log('Server: Authorization result:', isAuthorized);
    
    return isAuthorized;
  } catch (error) {
    console.error('Server: Error checking admin access:', error);
    return false;
  }
} 
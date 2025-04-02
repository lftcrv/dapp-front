'use server';

/**
 * Server action to check if a wallet address has admin access
 */
export async function checkAdminAccessDirectly(privyWalletAddress?: string, starknetWalletAddress?: string) {
  try {
    // Debug server environment variables
    console.log('Server: Environment variables available:');
    console.log('ADMIN_WALLET_ADDRESSES:', process.env.ADMIN_WALLET_ADDRESSES?.substring(0, 10) + '...');
    console.log('NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES:', process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES?.substring(0, 10) + '...');
    
    // CRITICAL FIX: There's a mismatch between the two environment variables!
    // The client uses NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES, but the server was using only ADMIN_WALLET_ADDRESSES
    // This means client-side checks passed but server-side checks failed
    // We'll now prioritize the NEXT_PUBLIC value for consistency
    
    const adminWalletString = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || process.env.ADMIN_WALLET_ADDRESSES || '';
    
    const adminWalletAddresses = adminWalletString
      ? adminWalletString.split(',').map(addr => addr.trim().toLowerCase())
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
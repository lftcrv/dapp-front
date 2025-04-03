'use server';

/**
 * Server action to check if a wallet address has admin access
 */
export async function checkAdminAccessDirectly(privyWalletAddress?: string, starknetWalletAddress?: string) {
  try {
    console.log('🔒 ADMIN ACCESS CHECK STARTED 🔒');
    
    // Log incoming wallet addresses with full formatting to catch any issues
    console.log('Raw wallet addresses to check:', JSON.stringify({
      privyWalletAddress,
      starknetWalletAddress
    }, null, 2));
    
    // Check for the problematic wallet address explicitly
    const problematicWallet = '0x013ebbf4905db3bfcc837efdbbced4a9ee2cb9bd7ea5f9a2213d6435c42e6fff';
    if (privyWalletAddress === problematicWallet || starknetWalletAddress === problematicWallet) {
      console.log('❌❌❌ DETECTED UNAUTHORIZED WALLET ATTEMPTING ADMIN ACCESS ❌❌❌');
      console.log(`Wallet ${problematicWallet} should NOT have admin access!`);
      return false;
    }

    // Get the authorized wallet addresses from environment variables
    const adminWalletAddressesRaw = process.env.ADMIN_WALLET_ADDRESSES || '';
    const publicAdminWalletAddressesRaw = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || '';
    
    console.log('Raw env variables:');
    console.log(`ADMIN_WALLET_ADDRESSES: "${adminWalletAddressesRaw}"`);
    console.log(`NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES: "${publicAdminWalletAddressesRaw}"`);
    
    // Improved parsing to handle spaces after commas
    const adminWalletAddresses = adminWalletAddressesRaw
      ? adminWalletAddressesRaw.split(',').map(addr => addr.trim().toLowerCase()).filter(Boolean)
      : [];
    
    // Also check the public admin wallet addresses
    const publicAdminWalletAddresses = publicAdminWalletAddressesRaw
      ? publicAdminWalletAddressesRaw.split(',').map(addr => addr.trim().toLowerCase()).filter(Boolean)
      : [];
    
    // Combine and deduplicate both sets of admin addresses
    const allAdminWallets = [...new Set([...adminWalletAddresses, ...publicAdminWalletAddresses])];
    
    console.log('Allowed admin wallet addresses:', JSON.stringify(allAdminWallets, null, 2));
    console.log('Number of allowed admin wallets:', allAdminWallets.length);
    
    // Double check that all wallets are properly formatted
    allAdminWallets.forEach((wallet, index) => {
      console.log(`Admin wallet #${index + 1}: ${wallet}`);
      if (!wallet.startsWith('0x') || wallet.length !== 66) {
        console.log(`⚠️ WARNING: Admin wallet ${wallet} might have incorrect format`);
      }
    });
    
    // Double check that the problematic wallet is not in the allow list
    if (allAdminWallets.includes(problematicWallet.toLowerCase())) {
      console.log(`⚠️ WARNING: Problematic wallet ${problematicWallet} found in admin list!`);
    }
    
    // Normalize the wallet addresses for comparison
    const normalizedPrivyAddress = privyWalletAddress?.toLowerCase().trim();
    const normalizedStarknetAddress = starknetWalletAddress?.toLowerCase().trim();
    
    console.log('Normalized addresses for comparison:');
    console.log(`Privy: ${normalizedPrivyAddress || 'none'}`);
    console.log(`Starknet: ${normalizedStarknetAddress || 'none'}`);
    
    // Only exact matches are allowed
    const isAuthorized = allAdminWallets.some(adminAddr => {
      console.log(`Comparing with admin address: ${adminAddr}`);
      
      // Exact match for Privy wallet
      if (normalizedPrivyAddress && normalizedPrivyAddress === adminAddr) {
        console.log(`✅ Admin match found: ${normalizedPrivyAddress} matches ${adminAddr}`);
        return true;
      }
      
      // Exact match for Starknet wallet
      if (normalizedStarknetAddress && normalizedStarknetAddress === adminAddr) {
        console.log(`✅ Admin match found: ${normalizedStarknetAddress} matches ${adminAddr}`);
        return true;
      }
      
      return false;
    });
    
    if (!isAuthorized) {
      console.log('❌ No admin wallet match found - ACCESS DENIED');
    } else {
      console.log('✅ Admin wallet match found - ACCESS GRANTED');
    }
    
    console.log(`Final authorization result: ${isAuthorized ? 'ALLOWED' : 'DENIED'}`);
    console.log('🔒 ADMIN ACCESS CHECK COMPLETED 🔒');
    
    return isAuthorized;
  } catch (error) {
    console.error('Server: Error checking admin access:', error);
    return false;
  }
} 
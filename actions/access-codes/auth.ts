const API_BASE_URL = '/api/access-code';

// Get the list of authorized admin wallet addresses from environment variables
// This will only work on the server side, so we'll need to use this in a server action
const ADMIN_WALLET_ADDRESSES = 
  typeof window === 'undefined' && (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || process.env.ADMIN_WALLET_ADDRESSES)
    ? ((process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || process.env.ADMIN_WALLET_ADDRESSES) ?? '').split(',').map(addr => {
        // Normalize the address: lowercase and ensure 0x prefix
        const normalized = addr.trim().toLowerCase();
        return normalized.startsWith('0x') ? normalized : `0x${normalized}`;
      })
    : [];

// Debug log for admin wallet addresses
console.log('Admin wallet addresses:', ADMIN_WALLET_ADDRESSES);
console.log('Admin wallet addresses raw:', process.env.ADMIN_WALLET_ADDRESSES);
console.log('NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES raw:', process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES);

/**
 * Normalizes a wallet address to a consistent format
 * - Converts to lowercase
 * - Ensures it has 0x prefix
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  
  // Convert to lowercase
  let normalized = address.trim().toLowerCase();
  
  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = `0x${normalized}`;
  }
  
  return normalized;
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/check`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasAccess || false;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
} 
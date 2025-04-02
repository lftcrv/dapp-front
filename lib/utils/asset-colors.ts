/**
 * Asset color management utilities
 * - Provides consistent colors for assets in portfolio visualizations
 * - Includes predefined colors for common assets
 * - Generates consistent random colors for unknown assets
 */

// Predefined colors for common crypto assets
export const ASSET_COLORS: Record<string, string> = {
  // Major cryptocurrencies
  'BTC': '#F7931A',  // Bitcoin orange
  'ETH': '#627EEA',  // Ethereum blue
  'SOL': '#14F195',  // Solana green
  'AVAX': '#E84142', // Avalanche red
  'ADA': '#0033AD',  // Cardano blue
  'DOT': '#E6007A',  // Polkadot pink
  
  // Stablecoins
  'USDC': '#2775CA',  // USDC blue
  'USDT': '#26A17B',  // Tether green
  'DAI': '#F5AC37',   // DAI gold
  'TUSD': '#1B31A2',  // TrueUSD blue
  'BUSD': '#F0B90B',  // Binance USD gold
  
  // Exchange tokens
  'BNB': '#F0B90B',   // Binance yellow
  'OKB': '#2671CC',   // OKX blue
  'CRO': '#103F68',   // Cronos blue
  'FTT': '#02A6C2',   // FTX blue
  
  // Layer 2s
  'MATIC': '#8247E5', // Polygon purple
  'OP': '#FF0420',    // Optimism red
  'ARB': '#28A0F0',   // Arbitrum blue
};

// Cache to store generated colors for assets not in the predefined list
const colorCache: Record<string, string> = {};

/**
 * Simple hash function to convert a string to a number
 * This ensures the same asset always gets the same color
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates a HSL color with fixed saturation and lightness
 * but with a hue based on the hash of the asset symbol
 * This creates vibrant, visually distinct colors
 */
function generateColorFromHash(hash: number): string {
  // Use the hash to generate a hue value between 0 and 360
  const hue = Math.abs(hash) % 360;
  // Fixed saturation and lightness for consistency
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Gets a color for an asset, using predefined colors when available
 * or generating a consistent color for unknown assets
 */
export function getAssetColor(symbol: string): string {
  // Return predefined color if available
  if (ASSET_COLORS[symbol]) {
    return ASSET_COLORS[symbol];
  }
  
  // Check if we've already generated a color for this asset
  if (colorCache[symbol]) {
    return colorCache[symbol];
  }
  
  // Generate a new color and cache it
  const hash = hashString(symbol);
  const color = generateColorFromHash(hash);
  colorCache[symbol] = color;
  
  return color;
} 
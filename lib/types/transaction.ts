export type SwapStatus = 
  | 'idle'
  | 'simulating'
  | 'preparing'
  | 'pending'
  | 'awaiting_confirmation'
  | 'success'
  | 'error';

export interface SwapState {
  status: SwapStatus;
  error: string | null;
  txHash?: string;
  simulatedAmount?: string;
}

export interface SwapResult {
  success: boolean;
  error?: string;
  data?: string;
} 
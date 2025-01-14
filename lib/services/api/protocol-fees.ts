import { ApiResponse } from './types'
import protocolFeesData from '@/data/protocol-fees.json'
import type { ProtocolFeesData } from '@/lib/types'

export const protocolFeesService = {
  async getProtocolFees(): Promise<ApiResponse<ProtocolFeesData>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      success: true,
      data: protocolFeesData as ProtocolFeesData
    }
  },

  async claimRewards(address: string): Promise<ApiResponse<{ claimed: string }>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const data = protocolFeesData as ProtocolFeesData
      return {
        success: true,
        data: {
          claimed: data.userShares[address] || "0"
        }
      }
    } catch {
      return {
        success: false,
        data: { claimed: "0" },
        error: {
          code: 'CLAIM_FAILED',
          message: 'Failed to claim rewards'
        }
      }
    }
  }
} 
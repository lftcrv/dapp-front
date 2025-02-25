// Paredex's trades infos
export interface ParadexPlaceOrderTradeInfos {
  market: string;
  side: string;
  type: string;
  size: string;
  price: string;
  instruction: string;
  explanation: string;
}

export interface ParadexCancelOrderInfos {
  explanation: string;
}

// Trade Types
export interface SwapAvnuTradeInfo {
  buyAmount: string;
  sellAmount: string;
  explanation: string;
  buyTokenName: string;
  sellTokenName: string;
  tradePriceUSD: number;
  buyTokenAddress: string;
  sellTokenAddress: string;
}

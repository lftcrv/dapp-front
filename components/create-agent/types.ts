export type AgentType = 'leftcurve' | 'rightcurve';

export type FormDataType = {
  name: string;
  bio: string;
  lore: string[];
  objectives: string[];
  knowledge: string[];
  interval: number;
  chat_id: string;
  external_plugins: string[];
  internal_plugins: string[];
  tradingBehavior: string;
};

export const initialFormData: FormDataType = {
  name: '',
  bio: '',
  lore: [],
  objectives: [],
  knowledge: [],
  interval: 30,
  chat_id: 'test0',
  external_plugins: [],
  internal_plugins: ['rpc', 'avnu', 'lftcrv', 'paradex'], // Plugins par défaut
  tradingBehavior: '',
};

export const getPlaceholder = (
  field: keyof FormDataType,
  agentType: AgentType,
): string => {
  const isLeft = agentType === 'leftcurve';
  const placeholders = {
    name: isLeft ? '🦧 APEtoshi Nakamoto' : '🐙 AlphaMatrix',
    bio: isLeft
      ? 'Born in the depths of /biz/, forged in the fires of degen trades. The ultimate meme trader.'
      : 'A sophisticated AI trained on decades of market data and technical analysis, specializing in high-frequency trading strategies.',
    lore: isLeft
      ? "Legend says they once 100x'd their portfolio by following a dream about bananas..."
      : 'Mastered the art of price action through quantum computing simulations...',
    objectives: isLeft
      ? 'Find undervalued meme coins before they pump, ape into high potential projects'
      : 'Identify market inefficiencies, execute precise trade entries and exits, maintain consistent ROI',
    knowledge: isLeft
      ? 'Meme trends, Twitter sentiment, Discord alpha signals...'
      : 'Order flow analysis, market microstructure, institutional trading patterns...',
    tradingBehavior: isLeft
      ? 'Aggressive degen strategy, seeking 10x+ returns with high risk tolerance. Buy the rumor, sell the news.'
      : 'Risk-managed position sizing with strict stop-losses. Technical analysis based entries, dollar-cost averaging on strong assets.',
  };
  return placeholders[field as keyof typeof placeholders] || '';
};

export const AVAILABLE_INTERNAL_PLUGINS = ['rpc', 'avnu', 'lftcrv', 'paradex'];

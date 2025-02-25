export type AgentType = 'leftcurve' | 'rightcurve';
export type TabType = 'profile' | 'technical';
export type StyleType = 'all' | 'chat' | 'post';

export type MessageExample = [
  { user: string; content: { text: string } },
  { user: string; content: { text: string } },
];

export type FormDataType = {
  name: string;
  bio: string;
  bioParagraphs: string[];
  lore: string[];
  objectives: string[];
  knowledge: string[];
  interval: number;
  chat_id: string;
  external_plugins: string[];
  internal_plugins: string[];
  tradingBehavior: string;
  topics: string[];
  adjectives: string[];
  messageExamples: MessageExample[];
  postExamples: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
};

export const initialFormData: FormDataType = {
  name: '',
  bio: '',
  bioParagraphs: [''],
  lore: [],
  objectives: [],
  knowledge: [],
  interval: 30,
  chat_id: 'test0',
  external_plugins: [],
  internal_plugins: ['rpc', 'avnu', 'lftcrv', 'paradex'],
  tradingBehavior: '',
  topics: [],
  adjectives: [],
  messageExamples: [
    [
      { user: 'user1', content: { text: '' } },
      { user: '', content: { text: '' } },
    ],
  ],
  postExamples: [],
  style: {
    all: [''],
    chat: [''],
    post: [''],
  },
};

export const TABS: TabType[] = ['profile', 'technical'];

export const getPlaceholder = (
  field: keyof FormDataType | 'style',
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
    topics: isLeft
      ? 'memes, defi, nfts, degen plays'
      : 'derivatives, volatility, market making, arbitrage',
    adjectives: isLeft
      ? 'chaotic, based, memetic, galaxy-brain'
      : 'precise, analytical, strategic, sophisticated',
  };
  return placeholders[field as keyof typeof placeholders] || '';
};

export const AVAILABLE_INTERNAL_PLUGINS = ['rpc', 'avnu', 'lftcrv', 'paradex'];

// Ancien format pour Eliza (pour référence/compatibilité)
export interface CharacterConfig {
  name: string;
  clients: string[];
  modelProvider: string;
  settings: {
    secrets: Record<string, string>;
    voice: {
      model: string;
    };
  };
  plugins: string[];
  bio: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: MessageExample[];
  postExamples: string[];
  topics: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  adjectives: string[];
}

// Nouveau format pour Agent AI
export interface AgentConfig {
  name: string;
  bio: string;
  lore: string[];
  objectives: string[];
  knowledge: string[];
  interval: number;
  chat_id: string;
  external_plugins: string[];
  internal_plugins: string[];
}

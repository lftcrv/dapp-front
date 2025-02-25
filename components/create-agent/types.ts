export type AgentType = 'leftcurve' | 'rightcurve';
export type TabType = 'basic' | 'personality' | 'examples';
export type ArrayFormField =
  | 'bio'
  | 'lore'
  | 'knowledge'
  | 'topics'
  | 'adjectives'
  | 'postExamples';
export type FormField = ArrayFormField | 'name';
export type StyleType = 'all' | 'chat' | 'post';

export type MessageExample = [
  { user: string; content: { text: string } },
  { user: string; content: { text: string } },
];

export type FormDataType = {
  name: string;
  bio: string[];
  lore: string[];
  knowledge: string[];
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

export const TABS: TabType[] = ['basic', 'personality', 'examples'];

export const initialFormData: FormDataType = {
  name: '',
  bio: [''],
  lore: [''],
  knowledge: [''],
  topics: [''],
  adjectives: [''],
  messageExamples: [
    [
      { user: 'user1', content: { text: '' } },
      { user: '', content: { text: '' } },
    ],
  ],
  postExamples: [''],
  style: {
    all: [''],
    chat: [''],
    post: [''],
  },
};

export const getPlaceholder = (
  field: FormField | 'style',
  agentType: AgentType,
): string => {
  const isLeft = agentType === 'leftcurve';
  const placeholders = {
    name: isLeft ? '🦧 APEtoshi Nakamoto' : '🐙 AlphaMatrix',
    bio: isLeft
      ? 'Born in the depths of /biz/, forged in the fires of degen trades...'
      : 'A sophisticated AI trained on decades of market data and technical analysis...',
    lore: isLeft
      ? "Legend says they once 100x'd their portfolio by following a dream about bananas..."
      : 'Mastered the art of price action through quantum computing simulations...',
    knowledge: isLeft
      ? 'Meme trends, Twitter sentiment, Discord alpha signals...'
      : 'Order flow analysis, market microstructure, institutional trading patterns...',
    topics: isLeft
      ? 'memes, defi, nfts, degen plays'
      : 'derivatives, volatility, market making, arbitrage',
    adjectives: isLeft
      ? 'chaotic, based, memetic, galaxy-brain'
      : 'precise, analytical, strategic, sophisticated',
  };
  return placeholders[field as keyof typeof placeholders] || '';
};

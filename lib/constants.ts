// App metadata
export const APP_NAME = 'LeftCurve';
export const APP_DESCRIPTION =
  'Discover and invest in unique trading agents powered by memes and AI';

// Wallet configuration
export const WALLET_CONFIG = {
  dappName: APP_NAME,
};

// Theme configuration
export const THEME = {
  colors: {
    primary: {
      gradient: {
        from: '#F76B2A',
        to: '#A047E4',
      },
    },
  },
};

// API endpoints
export const API_ENDPOINTS = {
  agents: '/api/agents',
  createAgent: '/api/agents/create',
  myAgents: '/api/agents/my',
  leaderboard: '/api/leaderboard',
};

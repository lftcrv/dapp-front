import { toast } from 'sonner';
import { Loader2, Rocket, Wallet, Bot, XCircle, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'loading';

const ICONS = {
  loader: Loader2,
  rocket: Rocket,
  wallet: Wallet,
  bot: Bot,
  error: XCircle,
} as const;

const MESSAGES = {
  CONNECTING: { text: '🦧 Aping into Starknet ser...', icon: 'wallet' },
  CONNECTED: { text: '🐋 Based! Wallet connected!', icon: 'wallet' },
  CONNECTION_ERROR: { text: '😭 Ngmi... Connection failed', icon: 'error' },
  EVM_CONNECTING: { text: '🦍 Summoning EVM wallet...', icon: 'wallet' },
  EVM_CONNECTED: { text: '🚀 Sigma grindset activated!', icon: 'wallet' },
  EVM_ERROR: { text: '💀 Down bad... EVM failed', icon: 'error' },
  EVM_DISCONNECT: { text: '👋 Paper hands detected', icon: 'wallet' },
  DEPLOYING: { text: '🐙 Deploying gigabrain agent...', icon: 'rocket' },
  DEPLOYED: { text: '🧠 Agent ready to flip midcurvers!', icon: 'bot' },
  DEPLOY_ERROR: { text: '🤡 Deployment rugged', icon: 'error' },
  DISCONNECT: { text: '🫡 See you on the curve ser', icon: 'wallet' },
  DEFAULT_ERROR: { text: '💩 Ngmi... Something went wrong', icon: 'error' },
  AGENT_ERROR: { text: '🤔 Fill in all agent details ser', icon: 'error' },
  AGENT_CREATING: { text: '🧪 Creating your 200 IQ agent...', icon: 'bot' },
  AGENT_SUCCESS: { text: '🎯 Agent created successfully!', icon: 'bot' },
  TX_PENDING: { text: '🚀 Transaction in flight ser...', icon: 'loader' },
  TX_SUCCESS: { text: '💎 Transaction confirmed! LFG!', icon: 'rocket' },
  TX_ERROR: { text: '💀 Transaction rugged ser...', icon: 'error' },
} as const;

// Keep track of toast IDs by message type
const toastIds = new Map<string, string>();

// Helper to dismiss related toasts
const dismissRelatedToasts = (messageType: string) => {
  // Define groups of related messages
  const relatedGroups = {
    TX: ['TX_PENDING', 'TX_SUCCESS', 'TX_ERROR'],
    AGENT: ['AGENT_CREATING', 'AGENT_SUCCESS', 'AGENT_ERROR'],
    DEPLOY: ['DEPLOYING', 'DEPLOYED', 'DEPLOY_ERROR'],
    CONNECT: ['CONNECTING', 'CONNECTED', 'CONNECTION_ERROR'],
    EVM: ['EVM_CONNECTING', 'EVM_CONNECTED', 'EVM_ERROR', 'EVM_DISCONNECT'],
  };

  // Find which group the message belongs to
  const group = Object.entries(relatedGroups).find(([_, messages]) =>
    messages.some(msg => messageType.includes(msg))
  );

  if (group) {
    // Dismiss all toasts in the same group
    group[1].forEach(msg => {
      const id = toastIds.get(msg);
      if (id) {
        toast.dismiss(id);
        toastIds.delete(msg);
      }
    });
  }
};

export function showToast(
  message: keyof typeof MESSAGES,
  type: ToastType = 'success',
  link?: { url: string; text: string } | string // Allow string for direct tx hash
) {
  const { text, icon } = MESSAGES[message];
  const Icon = ICONS[icon];

  // Convert transaction hash to link object if provided as string
  if (typeof link === 'string' && message === 'TX_SUCCESS') {
    link = {
      url: `https://starkscan.co/tx/${link}`,
      text: 'View on Starkscan'
    };
  }

  // Dismiss related toasts before showing new one
  dismissRelatedToasts(message);

  const toastType = message.includes('CONNECTING') ? 'success' : type;

  // Determine toast duration based on type
  let duration = 5000; // Default 5 seconds
  if (toastType === 'loading') {
    duration = message === 'AGENT_CREATING' ? 10000 : 30000; // AGENT_CREATING 10s, other loading toasts 30s
  } else if (toastType === 'success') {
    duration = message === 'TX_SUCCESS' ? 30000 : 10000; // TX_SUCCESS 30s, other success toasts 10s
  } else if (toastType === 'error') {
    duration = 15000; // Error toasts stay for 15 seconds
  }

  const id = toast[toastType](
    () => (
      <div className="min-h-[64px] min-w-[320px] flex items-center gap-4 px-4 py-3 bg-background border border-border rounded-lg shadow-lg">
        <div
          className={cn(
            'flex-shrink-0 p-2 rounded-full',
            toastType === 'loading' && 'bg-blue-50',
            toastType === 'error' && 'bg-red-50',
            toastType === 'success' && 'bg-green-50',
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6',
              toastType === 'loading' && 'animate-spin text-blue-500',
              toastType === 'error' && 'text-red-500',
              toastType === 'success' && 'text-green-500',
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm text-foreground">{text}</p>
          {typeof link === 'object' && link && (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
            >
              {link.text} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(id)}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    ),
    {
      duration,
      id: `${message}-${Date.now()}`,
      className: '!p-0 !bg-transparent !border-0 !shadow-none',
    },
  );

  // Store the toast ID
  toastIds.set(message, `${message}-${Date.now()}`);

  return id;
}

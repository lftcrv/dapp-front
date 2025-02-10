import { toast } from 'sonner';
import { Loader2, Rocket, Wallet, Bot, XCircle, X } from 'lucide-react';
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

export function showToast(
  message: keyof typeof MESSAGES,
  type: ToastType = 'success',
  link?: { url: string; text: string }
) {
  const { text, icon } = MESSAGES[message];
  const Icon = ICONS[icon];

  const toastType = message.includes('CONNECTING') ? 'success' : type;

  return toast[toastType](
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
          {link && (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
            >
              {link.text} <Rocket className="h-3 w-3" />
            </a>
          )}
        </div>
        <button
          onClick={() => toast.dismiss()}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    ),
    {
      duration: toastType === 'loading' ? Infinity : 2000,
      className: '!p-0 !bg-transparent !border-0 !shadow-none',
    },
  );
}

import { toast } from 'sonner'
import { Loader2, Rocket, Wallet, Bot, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'loading'

const ICONS = {
  loader: Loader2,
  rocket: Rocket,
  wallet: Wallet,
  bot: Bot,
  error: XCircle
} as const

const MESSAGES = {
  CONNECTING: { text: "GM! Connecting your Starknet wallet...", icon: 'wallet' },
  CONNECTED: { text: "Wallet connected!", icon: 'wallet' },
  CONNECTION_ERROR: { text: "Failed to connect wallet", icon: 'error' },
  EVM_CONNECTING: { text: "Connecting your EVM wallet...", icon: 'wallet' },
  EVM_CONNECTED: { text: "EVM wallet connected!", icon: 'wallet' },
  EVM_ERROR: { text: "Failed to connect EVM wallet", icon: 'error' },
  EVM_DISCONNECT: { text: "EVM wallet disconnected", icon: 'wallet' },
  DEPLOYING: { text: "Deploying your agent...", icon: 'rocket' },
  DEPLOYED: { text: "Agent deployed successfully!", icon: 'bot' },
  DEPLOY_ERROR: { text: "Failed to deploy agent", icon: 'error' },
  DISCONNECT: { text: "Wallet disconnected", icon: 'wallet' },
  DEFAULT_ERROR: { text: "An error occurred", icon: 'error' }
} as const

export function showToast(message: keyof typeof MESSAGES, type: ToastType = 'success') {
  const { text, icon } = MESSAGES[message]
  const Icon = ICONS[icon]
  
  const toastType = message.includes('CONNECTING') ? 'success' : type
  
  toast[toastType](
    () => (
      <div className="min-h-[64px] min-w-[320px] flex items-center gap-4 px-4 py-3 bg-background border border-border rounded-lg shadow-lg">
        <div className={cn(
          "flex-shrink-0 p-2 rounded-full",
          toastType === 'loading' && "bg-blue-50",
          toastType === 'error' && "bg-red-50",
          toastType === 'success' && "bg-green-50",
        )}>
          <Icon className={cn(
            "h-6 w-6",
            toastType === 'loading' && "animate-spin text-blue-500",
            toastType === 'error' && "text-red-500",
            toastType === 'success' && "text-green-500",
          )} />
        </div>
        <p className="font-mono text-sm text-foreground flex-1">{text}</p>
        <button 
          onClick={() => toast.dismiss()}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    ),
    {
      duration: toastType === 'loading' ? 0 : 2000,
      className: "!p-0 !bg-transparent !border-0 !shadow-none",
    }
  )
} 
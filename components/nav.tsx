import { ConnectWallet } from './connect-wallet'
import { DepositButton } from './deposit-button'

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">LeftCurve</span>
      </div>
      <div className="flex items-center gap-4">
        <DepositButton />
        <ConnectWallet />
      </div>
    </nav>
  )
} 
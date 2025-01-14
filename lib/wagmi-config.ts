import { createConfig, http } from 'wagmi'
import { mainnet, goerli } from 'viem/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, goerli],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
  },
}) 
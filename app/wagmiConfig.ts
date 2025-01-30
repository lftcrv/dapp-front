import { createConfig } from "@privy-io/wagmi";
import { mainnet, sepolia } from "viem/chains";
import { http } from "wagmi";

// Wagmi configuration for Privy
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

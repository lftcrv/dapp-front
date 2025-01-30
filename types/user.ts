export interface User {
  id: string;
  evmAddress?: string;
  starknetAddress?: string;
  name?: string;
  twitter?: string;
  lastConnection: string;
  createdAt: string;
  updatedAt: string;
  // Track how the user was created
  type: "derived" | "starknet_native";
}

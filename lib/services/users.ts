import fs from "fs";
import path from "path";
import { stark } from "starknet";

interface User {
  id: string;
  starknetAddress: string;
  evmAddress?: string;
  privateKey: string;
  name?: string;
  twitter?: string;
  createdAt: string;
  updatedAt: string;
}

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

// Helper to read users file
function readUsersFile(): { users: User[] } {
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify({ users: [] }, null, 2));
    return { users: [] };
  }
  const data = fs.readFileSync(USERS_FILE_PATH, "utf-8");
  return JSON.parse(data);
}

// Helper to write users file
function writeUsersFile(data: { users: User[] }) {
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(data, null, 2));
}

// Find user by either Starknet or EVM address
export function findUser(address: string): User | undefined {
  const { users } = readUsersFile();
  const normalizedSearchAddress = address.toLowerCase();
  console.log("Finding user for address:", normalizedSearchAddress);

  const user = users.find((user) => {
    const normalizedStarknetAddress = user.starknetAddress?.toLowerCase();
    const normalizedEvmAddress = user.evmAddress?.toLowerCase();

    console.log("Comparing with user:", {
      starknetAddress: normalizedStarknetAddress,
      evmAddress: normalizedEvmAddress,
    });

    return (
      normalizedStarknetAddress === normalizedSearchAddress ||
      normalizedEvmAddress === normalizedSearchAddress
    );
  });

  console.log("Found user:", user);
  return user;
}

// Create or update user
export function upsertUser(params: {
  evmAddress?: string;
  starknetAddress?: string;
  name?: string;
  twitter?: string;
}): User {
  const { users } = readUsersFile();
  const now = new Date().toISOString();

  // Try to find existing user
  let user = users.find(
    (u) =>
      (params.starknetAddress &&
        u.starknetAddress?.toLowerCase() ===
          params.starknetAddress.toLowerCase()) ||
      (params.evmAddress &&
        u.evmAddress?.toLowerCase() === params.evmAddress.toLowerCase()),
  );

  if (user) {
    // Update existing user
    user = {
      ...user,
      ...params,
      updatedAt: now,
    };

    // Update user in array
    const index = users.findIndex((u) => u.id === user!.id);
    users[index] = user;
  } else {
    // Create new user
    const privateKey = stark.randomAddress();
    // Generate a different random address for Starknet if not provided
    const starknetAddress = params.starknetAddress || stark.randomAddress();

    user = {
      id: `user_${Date.now()}`,
      starknetAddress,
      evmAddress: params.evmAddress,
      privateKey,
      name: params.name,
      twitter: params.twitter,
      createdAt: now,
      updatedAt: now,
    };

    users.push(user);
  }

  // Save to file
  writeUsersFile({ users });

  return user;
}

// Update user profile
export function updateUserProfile(
  address: string,
  updates: { name?: string; twitter?: string },
): User | undefined {
  const user = findUser(address);
  if (!user) return undefined;

  return upsertUser({
    starknetAddress: user.starknetAddress,
    evmAddress: user.evmAddress,
    ...updates,
  });
}

// Delete user
export function deleteUser(address: string): boolean {
  const { users } = readUsersFile();
  const initialLength = users.length;

  const newUsers = users.filter(
    (user) =>
      user.starknetAddress.toLowerCase() !== address.toLowerCase() &&
      user.evmAddress?.toLowerCase() !== address.toLowerCase(),
  );

  if (newUsers.length === initialLength) {
    return false;
  }

  writeUsersFile({ users: newUsers });
  return true;
}

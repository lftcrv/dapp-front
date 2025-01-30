import { type User } from "@/types/user";

// DEBUG LOGS: Prefix for easy removal
// const DEBUG = {
//   log: (...args: any[]) => console.log('[Starknet Derivation]:', ...args),
//   error: (...args: any[]) => console.error('[Starknet Derivation Error]:', ...args),
//   signature: (...args: any[]) => console.log('[Signature Storage]:', ...args)
// }

// Simple helper to manage signatures in localStorage
export const signatureStorage = {
  getSignature: (evmAddress: string) => {
    try {
      const signature = localStorage.getItem(
        `signature_${evmAddress.toLowerCase()}`,
      );
      DEBUG.log(
        `[Signature Storage] Retrieved signature for ${evmAddress}:`,
        signature ? "Found" : "Not found",
      );
      return signature;
    } catch (err) {
      DEBUG.error("[Signature Storage] Failed to get signature:", err);
      return null;
    }
  },

  saveSignature: (evmAddress: string, signature: string) => {
    try {
      localStorage.setItem(`signature_${evmAddress.toLowerCase()}`, signature);
      DEBUG.log(`[Signature Storage] Saved signature for ${evmAddress}`);
      return true;
    } catch (err) {
      DEBUG.error("[Signature Storage] Failed to save signature:", err);
      return false;
    }
  },

  verifySignature: (evmAddress: string, expectedSignature?: string) => {
    try {
      const savedSig = localStorage.getItem(
        `signature_${evmAddress.toLowerCase()}`,
      );
      if (!savedSig) {
        DEBUG.signature("No signature found for", evmAddress);
        return false;
      }

      if (expectedSignature && savedSig !== expectedSignature) {
        DEBUG.signature("Signature mismatch for", evmAddress);
        DEBUG.signature("Expected:", expectedSignature);
        DEBUG.signature("Found:", savedSig);
        return false;
      }

      DEBUG.signature("Signature verified for", evmAddress);
      return true;
    } catch (e) {
      DEBUG.error("Failed to verify signature", e);
      return false;
    }
  },

  clearSignature: (evmAddress: string) => {
    try {
      localStorage.removeItem(`signature_${evmAddress.toLowerCase()}`);
      DEBUG.log(`[Signature Storage] Cleared signature for ${evmAddress}`);
      return true;
    } catch (err) {
      DEBUG.error("[Signature Storage] Failed to clear signature:", err);
      return false;
    }
  },
};

// Helper to generate a random hex string of specified length
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length)
  );
}

// This interface will be used when we integrate with the real backend
interface DerivedStarknetAccount {
  starknetAddress: string;
}

export async function deriveStarknetAccount(
  evmAddress: string,
  signMessage: (message: string) => Promise<string>,
): Promise<User | null> {
  try {
    DEBUG.log("Starting derivation process for:", evmAddress);

    // Check if user already exists
    const response = await fetch("/api/users");

    if (!response.ok) {
      DEBUG.error("Failed to fetch users:", response.status);
      return null;
    }

    const data = await response.json();

    // Check for existing signature first
    const savedSignature = signatureStorage.getSignature(evmAddress);
    DEBUG.log("Saved signature check:", savedSignature ? "Found" : "Not found");

    // Safely check if users array exists
    if (data?.users?.length > 0) {
      const existingUser = data.users.find(
        (u: User) =>
          u.evmAddress?.toLowerCase() === evmAddress.toLowerCase() &&
          u.type === "derived",
      );

      if (existingUser) {
        DEBUG.log("Found existing derived user:", existingUser.starknetAddress);

        // Request signature if not saved
        if (!savedSignature) {
          DEBUG.log("No saved signature found, requesting new one");
          const message = `Sign this message to derive your Starknet account.\n\nEVM Address: ${evmAddress}`;
          const signature = await signMessage(message);
          signatureStorage.saveSignature(evmAddress, signature);
          DEBUG.log("New signature saved for existing user");
        }

        return existingUser;
      }
    }

    // Only proceed with derivation if no existing user was found
    DEBUG.log("No existing derived user found, starting derivation");
    const message = `Sign this message to derive your Starknet account.\n\nEVM Address: ${evmAddress}`;

    // Get signature from wallet (only if we don't have it saved)
    const signature = savedSignature || (await signMessage(message));
    if (!savedSignature) {
      signatureStorage.saveSignature(evmAddress, signature);
    }

    // Generate a random Starknet address for simulation
    const randomStarknetAddress = generateRandomHex(64);
    DEBUG.log("Generated new Starknet address:", randomStarknetAddress);

    // Create timestamp for all date fields
    const timestamp = new Date().toISOString();

    // Create user object
    const user: User = {
      id: `user_${Date.now()}`,
      evmAddress: evmAddress.toLowerCase(),
      starknetAddress: randomStarknetAddress,
      type: "derived",
      lastConnection: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save user to database
    const saveResponse = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (!saveResponse.ok) {
      // If user already exists (409), just return null without throwing
      if (saveResponse.status === 409) {
        DEBUG.log("User creation failed - already exists");
        return null;
      }
      const error = await saveResponse.json();
      throw new Error(error.error || "Failed to save user");
    }

    const savedUser = await saveResponse.json();
    DEBUG.log(
      "Successfully created new user with address:",
      savedUser.starknetAddress,
    );
    return savedUser;
  } catch (err) {
    DEBUG.error("Derivation failed:", err);
    return null;
  }
}

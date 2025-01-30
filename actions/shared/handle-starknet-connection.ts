import type { User } from '@/types/user';

export async function handleStarknetConnection(
  starknetAddress: string,
): Promise<User> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        starknetAddress,
        type: 'starknet_native',
      }),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}`);
    }

    return response.json();
  } catch (err) {
    // Let the caller handle the error
    throw err;
  }
}

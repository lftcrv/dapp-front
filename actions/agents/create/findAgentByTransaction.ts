'use server';

export async function findAgentByTransaction(
  transactionHash: string,
  creatorWallet?: string,
): Promise<{ success: boolean; agentId?: string; error?: string }> {
  try {
    if (!transactionHash) {
      console.error('Missing transaction hash for agent lookup');
      return {
        success: false,
        error: 'Missing transaction hash',
      };
    }

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('Missing API configuration');
      return {
        success: false,
        error: 'Missing API configuration',
      };
    }

    console.log('Looking up agent by transaction:', transactionHash);

    const url = new URL(`${apiUrl}/api/eliza-agent/by-transaction`);
    url.searchParams.append('transactionHash', transactionHash);
    if (creatorWallet) {
      url.searchParams.append('creatorWallet', creatorWallet);
    }

    // Add cache-busting parameter
    url.searchParams.append('t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    const result = await response.json();

    if (result.status === 'success' && result.data?.agent?.id) {
      console.log('Found agent by transaction lookup:', result.data.agent.id);
      return {
        success: true,
        agentId: result.data.agent.id,
      };
    } else {
      console.log('No agent found by transaction lookup');
      return {
        success: false,
        error: 'Agent not found',
      };
    }
  } catch (error) {
    console.error('Error looking up agent by transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

'use server';

interface TokenSimulationResponse {
  status: string;
  data: {
    amount: string;
  };
}

interface BondingCurveResponse {
  status: string;
  data: {
    percentage: number;
  };
}

export async function simulateBuyTokens(agentId: string, tokenAmount: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/simulate-buy?tokenAmount=${tokenAmount}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to simulate buy');
    }

    const data = (await response.json()) as TokenSimulationResponse;
    return {
      success: true,
      data: BigInt(data.data.amount),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function simulateSellTokens(agentId: string, tokenAmount: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/simulate-sell?tokenAmount=${tokenAmount}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to simulate sell');
    }

    const data = (await response.json()) as TokenSimulationResponse;
    return {
      success: true,
      data: BigInt(data.data.amount),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getBondingCurvePercentage(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/bonding-curve-percentage`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get bonding curve percentage');
    }

    const data = (await response.json()) as BondingCurveResponse;
    return {
      success: true,
      data: data.data.percentage,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

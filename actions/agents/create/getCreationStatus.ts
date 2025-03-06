'use server';

export async function getCreationStatus(orchestrationId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('❌ Missing API configuration');
      return {
        success: false,
        error: 'Missing API configuration',
      };
    }

    const response = await fetch(
      `${apiUrl}/api/eliza-agent/creation/${orchestrationId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to get creation status',
      };
    }
  } catch (error) {
    console.error('❌ Error getting creation status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

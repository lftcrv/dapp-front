'use server';

import { AccessCode } from '../../types/accessCode';

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

export async function validateAccessCode(
  code: string,
  userId: string,
): Promise<{
  isValid: boolean;
  accessCode?: AccessCode;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${API_URL}/api/access-code/access-codes/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY as string,
        },
        body: JSON.stringify({ code, userId }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        isValid: false,
        error: data.error || 'Failed to validate access code',
      };
    }

    return {
      isValid: true,
      accessCode: data.accessCode,
    };
  } catch (error) {
    console.error('Error validating access code:', error);
    return {
      isValid: false,
      error: 'Failed to validate access code',
    };
  }
}

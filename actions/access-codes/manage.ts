'use server';

import { AccessCode } from '../../types/accessCode';

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API key is required');
}

interface RenewParams {
  expiresAt?: string;
  maxUses?: number;
}

/**
 * Disable an access code by its ID
 * @param id The ID of the access code to disable
 * @returns Promise<boolean> indicating whether the operation was successful
 */
export async function disableAccessCode(id: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY as string,
    };

    const response = await fetch(
      `${API_URL}/api/access-code/access-codes/disable/${id}`,
      {
        method: 'PUT',
        headers,
      },
    );

    if (!response.ok) {
      console.error(
        `Error disabling code: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const data = await response.json();
    return data.disabled || false;
  } catch (error) {
    console.error('Error disabling access code:', error);
    return false;
  }
}

/**
 * Renew an access code with new parameters
 * @param id The ID of the access code to renew
 * @param params Object containing optional expiresAt and maxUses parameters
 * @returns Promise<AccessCode | null> The renewed access code or null if operation failed
 */
export async function renewAccessCode(
  id: string,
  params: RenewParams,
): Promise<AccessCode | null> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY as string,
    };

    const response = await fetch(
      `${API_URL}/api/access-code/access-codes/renew/${id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(params),
      },
    );

    if (!response.ok) {
      console.error(
        `Error renewing code: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    // Check if the response has the expected format
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error renewing access code:', error);
    return null;
  }
}

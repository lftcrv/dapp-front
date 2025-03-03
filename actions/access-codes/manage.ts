'use server';

import { AccessCode } from '../../types/accessCode';

const API_URL = 'http://localhost:8080';
// API key for authentication
const API_KEY = 'carbonable-our-giga-secret-api-key';

export async function disableAccessCode(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/access-code/access-codes/disable/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Error disabling code: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    return data.disabled || false;
  } catch (error) {
    console.error('Error disabling access code:', error);
    return false;
  }
}

export async function renewAccessCode(id: string, params: {
  expiresAt?: string;
  maxUses?: number;
}): Promise<AccessCode | null> {
  try {
    const response = await fetch(`${API_URL}/api/access-code/access-codes/renew/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error(`Error renewing code: ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error renewing access code:', error);
    return null;
  }
} 
'use server';

const API_URL = 'http://localhost:8080';
// API key for authentication
const API_KEY = 'carbonable-our-giga-secret-api-key';

export async function getAccessCodeStatus(id: string): Promise<{
  isActive: boolean;
  isExpired: boolean;
  isFullyUsed: boolean;
}> {
  try {
    const response = await fetch(`${API_URL}/api/access-code/access-codes/status/${id}`, {
      headers: {
        'x-api-key': API_KEY,
      }
    });
    
    if (!response.ok) {
      console.error(`Error getting code status: ${response.status} ${response.statusText}`);
      return {
        isActive: false,
        isExpired: false,
        isFullyUsed: false
      };
    }
    
    return response.json();
  } catch (error) {
    console.error('Error getting access code status:', error);
    return {
      isActive: false,
      isExpired: false,
      isFullyUsed: false
    };
  }
} 
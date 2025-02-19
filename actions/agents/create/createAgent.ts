'use server';

import { CharacterConfig } from '@/lib/types';

interface CreateAgentResponse {
  status: string;
  data: {
    orchestrationId: string;
    message: string;
  };
}

export async function createAgent(
  name: string,
  characterConfig: CharacterConfig,
  curveSide: 'LEFT' | 'RIGHT',
  creatorWallet: string,
  transactionHash: string,
  profilePicture?: File,
): Promise<{ success: boolean; data?: CreateAgentResponse; error?: string }> {
  try {
    // Validate and format agent name
    const nameValidation = validateAgentName(name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.error);
    }
    const formattedName = nameValidation.formattedName;

    console.log('🤖 Creating agent:', {
      originalName: name,
      formattedName,
      curveSide,
      creatorWallet,
      transactionHash,
      hasProfilePicture: !!profilePicture,
    });

    // Validate required fields
    if (!formattedName || !curveSide || !creatorWallet || !transactionHash) {
      throw new Error('Missing required fields');
    }

    const formData = new FormData();

    // Add all text fields first
    formData.append('name', formattedName);
    formData.append('curveSide', curveSide);
    formData.append('creatorWallet', creatorWallet);
    formData.append('transactionHash', transactionHash);
    formData.append('characterConfig', JSON.stringify({
      ...characterConfig,
      name: formattedName // Update name in character config too
    }));

    // Handle profile picture if present
    if (profilePicture) {
      console.log('🔍 Validating profile picture:', {
        name: profilePicture.name,
        type: profilePicture.type,
        size: profilePicture.size,
        lastModified: new Date(profilePicture.lastModified).toISOString(),
      });

      // Validate file type again before sending
      if (!profilePicture.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', profilePicture.type);
        throw new Error('Invalid file type');
      }

      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      if (!allowedTypes.includes(profilePicture.type)) {
        console.error('❌ File type not allowed:', profilePicture.type);
        throw new Error('Only JPG, PNG and GIF files are allowed');
      }

      // Check if file has proper extension
      const extension = profilePicture.name.split('.').pop()?.toLowerCase();
      if (!extension || !['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        console.error('❌ Invalid file extension:', extension);
        throw new Error(
          'File must have a valid extension (jpg, jpeg, png, gif)',
        );
      }

      console.log('✅ File validation passed');
      console.log('🖼️ Adding profile picture:', {
        name: profilePicture.name,
        type: profilePicture.type,
        size: `${(profilePicture.size / (1024 * 1024)).toFixed(2)}MB`,
      });

      // Ensure we're sending with the correct filename and type
      formData.append('profilePicture', profilePicture, profilePicture.name);
    }

    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('❌ Missing API configuration:', {
        hasApiUrl: !!apiUrl,
        hasApiKey: !!apiKey,
      });
      throw new Error('Missing API configuration');
    }

    console.log('🚀 Sending request to:', `${apiUrl}/api/eliza-agent`);

    // Log the FormData contents for debugging
    console.log('📦 FormData contents:');
    let totalSize = 0;
    for (const pair of formData.entries()) {
      if (pair[0] === 'profilePicture') {
        const file = pair[1] as File;
        console.log('- profilePicture:', {
          name: file.name,
          type: file.type,
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          lastModified: new Date(file.lastModified).toISOString(),
        });
        totalSize += file.size;
      } else {
        console.log(`- ${pair[0]}: ${pair[1]}`);
        if (typeof pair[1] === 'string') {
          totalSize += pair[1].length;
        }
      }
    }
    console.log(
      '📊 Total request size:',
      `${(totalSize / (1024 * 1024)).toFixed(2)}MB`,
    );

    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        // Note: Don't set Content-Type header, browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(data.message || 'Invalid request data');
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 413) {
        throw new Error('File size too large');
      } else if (response.status === 415) {
        throw new Error('Unsupported file type');
      } else {
        throw new Error(data.message || 'Failed to create agent');
      }
    }

    console.log('✅ Agent created successfully:', data);

    return {
      success: true,
      data: data as CreateAgentResponse,
    };
  } catch (error) {
    console.error('❌ Error creating agent:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

function validateAgentName(name: string): { 
  isValid: boolean; 
  error?: string;
  formattedName?: string;
} {
  if (!name || !name.trim()) {
    return { 
      isValid: false, 
      error: 'Agent name is required' 
    };
  }

  // Remove leading/trailing spaces
  const trimmedName = name.trim();

  // Check length after trimming
  if (trimmedName.length < 2) {
    return { 
      isValid: false, 
      error: 'Agent name must be at least 2 characters long' 
    };
  }

  if (trimmedName.length > 32) {
    return { 
      isValid: false, 
      error: 'Agent name must be less than 32 characters' 
    };
  }

  // Replace spaces with hyphens and ensure only allowed characters
  const formattedName = trimmedName
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9_.-]/g, '') // Remove any other disallowed characters
    .toLowerCase();                   // Convert to lowercase for consistency

  // Validate the final format
  const validNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
  if (!validNameRegex.test(formattedName)) {
    return { 
      isValid: false, 
      error: 'Agent name can only contain letters, numbers, hyphens, dots, and underscores, and must start with a letter or number' 
    };
  }

  return {
    isValid: true,
    formattedName
  };
}

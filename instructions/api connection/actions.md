ce que je dois faire c'est bien
creer repertoir action
create agent > front composent send data server side taht will code endpoint
4 réponses

Yes tu crées un répertoire avec/actions/createAgent.ts

je le mets dans app ou juste dans root/api/actions/

root/actions

au même niveau que component, context, etc.

Ca c'est un exemple d'action:

import { PaginatedResponse } from '@/types/api/pagination';
import { Project } from '@/types/prisma-types';
import { authenticatedFetch, handleApiError } from '@/utils/auth';

export async function getProjects(): Promise<PaginatedResponse<Project>> {
try {
return await authenticatedFetch<PaginatedResponse<Project>>('/projects');
} catch (error) {
return handleApiError(error);
}
}
C'est dans /actions/getProjects.ts
authenticatedFetch on n'en a pas besoin c'est dans le ccrp pour gérer les utilisateurs connectés.
Derrière ça fait juste un fetch comme ça:
const response = await fetch(url.toString(), {
...options,
headers,
});

Un autre exemple avec une requête POST:
'use server'

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

interface User {
id: string;
email: string;
roles: string[];
}

export async function login(email: string, password: string) {
try {
const response = await fetch(`${process.env.API_URL}/auth/login`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password }),
});

    if (!response.ok) {
      if (response.status === 401 || response.status === 404) {
        throw new Error('Invalid credentials');
      } else if (response.status >= 500) {
        throw new Error('Server error');
      } else {
        throw new Error('Login failed');
      }
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('Token not received from server');
    }

    // Set the token as an HTTP-only cookie
    cookies().set('token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    // Decode the JWT to get user information
    const decodedToken = jwtDecode<User>(data.access_token);

    // Return user information (without the token)
    return {
      id: decodedToken.id,
      email: decodedToken.email,
      roles: decodedToken.roles
    };

} catch (error) {
if (error instanceof Error) {
// Rethrow the error with the same message
throw error;
} else {
// If it's not an Error instance, throw a generic error
throw new Error('An unexpected error occurred');
}
}
}

export async function logout() {
cookies().delete('token');
}

export async function checkAuth() {
const token = cookies().get('token')?.value;

if (!token) {
throw new Error('Not authenticated');
}

try {
const decodedToken = jwtDecode<User>(token);
return {
id: decodedToken.id,
email: decodedToken.email,
roles: decodedToken.roles
};
} catch (error) {
throw new Error('Invalid token: ' + error);
}
}

11 h 03
Coté composant front pour appeler l'action login c'est comme ça:
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }

};

<form onSubmit={handleSubmit} className='mt-12'>

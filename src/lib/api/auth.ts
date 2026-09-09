// lib/api/auth.ts
import { apiClient } from './client';
import { AuthUser, UserRole } from '@/types/auth';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

/**
 * Calls POST /auth/login.
 * On success, stores the JWT in localStorage under 'token'.
 */
export async function loginApi(credentials: LoginCredentials): Promise<LoginResult> {
  console.log('[Auth] 🔐 Login attempt →', { email: credentials.email });

  const response = await apiClient.post<{
    token: string;
    user?: { id: number; name: string; email: string; role: string; shopId?: number };
  }>('/auth/login', credentials);

  console.log('[Auth] ✅ Backend responded with token');

  // Decode token to get single source of truth
  const decodedToken: any = jwtDecode(response.token);
  console.log('[Auth] 🔓 Decoded JWT claims →', {
    sub:    decodedToken.sub,
    role:   decodedToken.role,
    name:   decodedToken.name,
    shopId: decodedToken.shopId ?? null,
    exp:    new Date(decodedToken.exp * 1000).toLocaleString(),
  });

  const authUser: AuthUser = {
    id:     decodedToken.id || 0,
    name:   decodedToken.name || '',
    email:  decodedToken.sub  || '',
    role:   decodedToken.role as UserRole,
    shopId: decodedToken.shopId,
  };

  console.log('[Auth] 👤 Auth user built →', authUser);

  // Persist ONLY the token. The AuthGuard and components will decode this token for user data.
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', response.token);
    console.log('[Auth] 💾 Token saved to localStorage');
  }

  return { token: response.token, user: authUser };
}

/** Clears local session (JWT). */
export function logoutApi(): void {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('[Auth] 🚪 Logging out user →', {
          email: decoded.sub,
          role:  decoded.role,
          name:  decoded.name,
        });
      } catch {
        console.log('[Auth] 🚪 Logging out (token could not be decoded)');
      }
    }
    localStorage.removeItem('token');
    console.log('[Auth] 🗑️  Token removed from localStorage');
  }
}

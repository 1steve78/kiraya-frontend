// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthUser, UserRole } from '@/types/auth';
import { loginApi, logoutApi, LoginCredentials } from '@/lib/api/auth';

const DEFAULT_SHOP_OWNER: AuthUser = {
  id: 1,
  name: 'Yasin (Shop Owner)',
  email: 'yasin@freshmart.com',
  role: 'SHOP_OWNER',
  shopId: 1,
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(DEFAULT_SHOP_OWNER);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, restore persisted session from JWT
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decodedToken: any = jwtDecode(storedToken);
        if (decodedToken.exp > Date.now() / 1000) {
          const restoredUser = {
            id:     decodedToken.id || 0,
            name:   decodedToken.name || '',
            email:  decodedToken.sub || '',
            role:   decodedToken.role as UserRole,
            shopId: decodedToken.shopId,
          };
          setUser(restoredUser);
          setIsAuthenticated(true);
          console.log('[Auth] 🔄 Session restored from token →', restoredUser);
        } else {
          localStorage.removeItem('token');
          console.warn('[Auth] ⏰ Stored token is expired — cleared');
        }
      } else {
        console.log('[Auth] ℹ️  No stored token found on mount');
      }
    } catch (err) {
      console.error('[Auth] ❌ Failed to decode stored token →', err);
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  /**
   * Authenticates against the real backend (POST /auth/login).
   * Stores JWT in localStorage so all subsequent API calls are authenticated.
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials);
    const authUser: AuthUser = {
      ...result.user,
      shopId: (result.user as AuthUser & { shopId?: number }).shopId ?? undefined,
    };
    setUser(authUser);
    setIsAuthenticated(true);
    console.log('[Auth] ✅ useAuth login complete →', { role: authUser.role, shopId: authUser.shopId ?? null });
    return result;
  }, []);

  /**
   * Clears local session.
   */
  const logout = useCallback(() => {
    console.log('[Auth] 🚪 useAuth logout triggered');
    logoutApi();
    setUser(DEFAULT_SHOP_OWNER);
    setIsAuthenticated(false);
    // ensure token is cleared
    localStorage.removeItem('token');
    console.log('[Auth] 🔒 User state reset after logout');
  }, []);

  /**
   * Demo-only: switch role without backend login.
   * Useful for UI testing without a real backend session.
   */
  const switchRole = useCallback((role: UserRole, shopId: number = 1) => {
    const updatedUser: AuthUser = {
      id: role === 'SHOP_OWNER' ? 1 : 205,
      name: role === 'SHOP_OWNER' ? 'Yasin (Shop Owner)' : 'Customer User',
      email: role === 'SHOP_OWNER' ? 'yasin@freshmart.com' : 'customer@example.com',
      role,
      shopId: role === 'SHOP_OWNER' || role === 'SHOP_STAFF' ? shopId : undefined,
    };
    setUser(updatedUser);
  }, []);

  const isAuthorizedForShop = useCallback(
    (targetShopId: number = 1) => {
      if (!user) return false;
      if (user.role === 'ADMIN') return true;
      if (user.role === 'SHOP_OWNER' || user.role === 'SHOP_STAFF') {
        return user.shopId === targetShopId;
      }
      return false;
    },
    [user]
  );

  return {
    user,
    isAuthLoaded,
    isAuthenticated,
    login,
    logout,
    switchRole,
    isAuthorizedForShop,
  };
}

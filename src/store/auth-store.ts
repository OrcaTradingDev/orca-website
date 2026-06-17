import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { http } from '@/lib/http';

interface JWTPayload {
  iss: string;
  sub: string;     // Google's unique ID
  email: string;
  name: string;
  picture: string | null;
  screener_access: boolean;
  is_admin: boolean;
  iat: number;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    picture: string | null;
    screenerAccess: boolean;
    isAdmin: boolean;
  } | null;
  isHydrated: boolean;
  setAuth: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  /** Re-fetches the user's JWT from the backend so screener_access updates instantly after payment. */
  refreshAuth: () => Promise<void>;
}

/** Returns true if the JWT exp timestamp is in the past. */
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JWTPayload>(token);
    // exp is in seconds; give a 30-second grace window
    return Date.now() / 1000 > exp - 30;
  } catch {
    return true; // treat malformed tokens as expired
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,

      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          set({
            token,
            user: {
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              picture: decoded.picture,
              screenerAccess: decoded.screener_access ?? false,
              isAdmin: decoded.is_admin ?? false,
            },
          });
        } catch (error) {
          console.error("Invalid token format:", error);
          set({ token: null, user: null });
        }
      },

      logout: () => set({ token: null, user: null }),

      refreshAuth: async () => {
        try {
          const { data } = await http.get<{ token: string }>("/auth/google/me/refresh");
          const decoded = jwtDecode<JWTPayload>(data.token);
          set({
            token: data.token,
            user: {
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              picture: decoded.picture,
              screenerAccess: decoded.screener_access ?? false,
              isAdmin: decoded.is_admin ?? false,
            },
          });
        } catch (err) {
          console.error("Failed to refresh auth token:", err);
        }
      },

      setHasHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Clear expired tokens immediately on page load so users are never
        // shown as "logged in" while the backend rejects their requests.
        if (state?.token && isTokenExpired(state.token)) {
          state.token = null;
          state.user = null;
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

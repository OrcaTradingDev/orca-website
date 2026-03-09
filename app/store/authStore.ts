import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  username?: string; 
  exp?: number;
}

interface AuthState {
  token: string | null;
  userName: string | null;
  exp: number | null;
  isHydrated: boolean;
  setAuth: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

const initialState = {
  token: null,
  userName: null,
  exp: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      isHydrated: false, // We keep this out of initialState so it doesn't reset on logout

      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          set({ 
            token, 
            userName: decoded.username || null, 
            exp: decoded.exp || null 
          });
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      },

      logout: () => {
        // We reset the auth data but keep isHydrated as true
        set({ ...initialState });
      },

      setHasHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // This part ensures Next.js knows when the browser has finished loading the data
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

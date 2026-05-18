import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  iss: string;
  sub: string;     // Google's unique ID
  email: string;
  name: string;
  picture: string | null;
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
  } | null;
  isHydrated: boolean;
  setAuth: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
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
            },
          });
        } catch (error) {
          console.error("Invalid token format:", error);
          set({ token: null, user: null });
        }
      },

      logout: () => set({ token: null, user: null }),
      
      setHasHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

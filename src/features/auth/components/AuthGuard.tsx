'use client';
import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Paths used for authentication flow (login, callback)
const AUTH_PATHS = ['/login', '/auth/callback'] as const;
// All publicly accessible paths (no login required)
const PUBLIC_PATHS = ['/', '/orcabot', ...AUTH_PATHS] as const;

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = (PUBLIC_PATHS as readonly string[]).includes(pathname);
  const isAuthPath = (AUTH_PATHS as readonly string[]).includes(pathname);

  useEffect(() => {
    if (isHydrated && !isPublicPath && !token) {
      router.replace('/login');
    } else if (isHydrated && isAuthPath && token) {
      router.replace('/');
    }
  }, [isHydrated, pathname, router, token, isPublicPath, isAuthPath]);

  // Not hydrated yet — show loader
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Getting things ready...
      </div>
    );
  }

  // Private route with no token — wait for redirect
  if (!isPublicPath && !token) return null;

  // Auth page with valid token — wait for redirect
  if (isAuthPath && token) return null;

  return <>{children}</>;
}

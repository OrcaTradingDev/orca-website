'use client';
import { useAuthStore } from "@/app/store/authStore";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const authPath = ['/login', '/auth/callback'];
  const publicPath = ['/', ...authPath];

  const isPublicPath = publicPath.includes(pathname);
  const isAuthPath = authPath.includes(pathname);

  useEffect(() => {
    if (isHydrated && !isPublicPath && !token) {
      router.replace('/login');
    } else if (isHydrated && isAuthPath && token) {
      router.replace('/');
    }
  }, [isHydrated, pathname, router, token, isPublicPath, isAuthPath]);

  // 1. Not hydrated yet — show loader
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Getting things ready...
      </div>
    );
  }

  // 2. Hydrated but no token on a private route — render nothing while redirect fires
  if (!isPublicPath && !token) {
    return null;
  }

  // 3. Hydrated, has token, but trying to visit an auth page — render nothing while redirect fires
  if (isAuthPath && token) {
    return null;
  }

  return <>{children}</>;
}

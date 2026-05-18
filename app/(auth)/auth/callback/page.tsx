'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

// 1. The main logic component
function AuthCallbackContent() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth); 

  useEffect(() => {
    // Grab the hash from the URL (e.g., #token=eyJh...)
    const hash = window.location.hash;

    // If there's no hash at all, kick them back to login
    if (!hash) {
      console.error("No URL fragment found.");
      router.replace('/login');
      return;
    }

    // Convert the hash into a readable format to extract 'token'
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('token');

    // Validating the token
    if (!token) {
      console.error(`Token not found in hash: ${hash}`);
      router.replace('/login');
      return;
    }

    // Saving token to local storage AND updating Zustand state
    setAuth(token);

    // Redirecting to homepage securely
    router.replace('/');

  }, [setAuth, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-2 text-xl font-bold">Finalizing Login...</h1>
      <p className="text-gray-500">Please wait while we sync your account.</p>
    </div>
  );
}

// 2. The Suspense wrapper (Great practice for Next.js!)
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        Loading authentication...
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

// The main logic component using your variables
function AuthCallbackContent() {
  const router = useRouter();
  const callbackParams = useSearchParams(); // getting the params
  const setAuth = useAuthStore((state) => state.setAuth); 

  useEffect(() => {
    // reading the params for jwt
    const jwt = callbackParams.get('jwt');

    // validating jwt;
    if (!jwt) {
      console.error(`JWT not found in params jwt:${jwt}`);
      router.push('/login');
      return;
    }

    // saving jwt to local storage AND updating Zustand state
    setAuth(jwt);

    // redirecting to homepage
    router.replace('/');

  }, [callbackParams, setAuth, router]);

return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Finalizing Login...</h1>
      <p>Please wait while we redirect you.</p>
    </div>
  );
}

// 2. We export a default component that wraps the content in Suspense
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

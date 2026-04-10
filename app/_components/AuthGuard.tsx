'use client';

import { useAuthStore } from "@/app/store/authStore";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';


export default function AuthGuard( {children} : {children : React.ReactNode }){
  // getting all the requirements
  const { token, isHydrated }= useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Identifying if the path is public/auth, private. 
  const authPath = ['/login', '/auth/callback']; // paths used for auth, also public paths.
  const publicPath = ['/','/orcabot', ...authPath]; // all the publicly accesible paths. 
  
  const isPublicPath = publicPath.includes(pathname); 
  const isAuthPath = authPath.includes(pathname);



  useEffect(()=> {
    // Private Gurad : No Token, Private path, Hydrated => redirect to login 
    if (isHydrated && !isPublicPath && !token ){
      router.replace('/login');
    }
    // Reverse Guard : Have token => restrict auth pages. 
    else if( isHydrated && isAuthPath && token ){ // Logic for authenticated user, if they try to visit auth paths.
      router.replace('/');
    } 
    
  }, [isHydrated, pathname, router, token, isPublicPath, isAuthPath])


  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        Getting things ready...
      </div>
    );
  }

  return <>{children}</>;
}

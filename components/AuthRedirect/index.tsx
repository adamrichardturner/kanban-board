'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, usePostLoginRoute } from '@/hooks/auth/useAuth';

export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: postLoginRoute, isLoading: routeLoading } = usePostLoginRoute();

  useEffect(() => {
    if (
      isAuthenticated &&
      postLoginRoute &&
      !authLoading &&
      !routeLoading &&
      pathname !== postLoginRoute &&
      (pathname === '/login' || pathname === '/' || pathname === '/boards')
    ) {
      router.push(postLoginRoute);
    }
  }, [
    isAuthenticated,
    postLoginRoute,
    authLoading,
    routeLoading,
    pathname,
    router,
  ]);

  return null;
}

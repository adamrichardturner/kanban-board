'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthUser, AuthResponse, ApiResponse, BoardResponse } from '@/types';
import { toast } from 'sonner';

async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }
  const data: ApiResponse<AuthUser> = await res.json();
  return data.data!;
}

async function fetchPostLoginRoute(): Promise<string> {
  try {
    const res = await fetch('/api/boards');
    if (!res.ok) {
      return '/boards';
    }

    const data: ApiResponse<BoardResponse[]> = await res.json();
    const boards = data.data;

    if (boards && boards.length > 0) {
      const sortedBoards = boards.sort((a, b) => a.position - b.position);
      return `/boards/${sortedBoards[0].id}`;
    }

    return '/boards';
  } catch (error) {
    console.error('Failed to determine post-login route:', error);
    return '/boards';
  }
}

export function useCurrentUser() {
  return useQuery<AuthUser, Error>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function usePostLoginRoute(enabledOverride?: boolean) {
  const { isAuthenticated } = useAuth();
  const enabled = enabledOverride ?? isAuthenticated;

  return useQuery<string, Error>({
    queryKey: ['postLoginRoute'],
    queryFn: fetchPostLoginRoute,
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Clear navigating flag when we arrive at the destination
  useEffect(() => {
    if (!navigatingTo || !pathname) {
      return;
    }
    if (pathname === navigatingTo || pathname.startsWith(navigatingTo)) {
      setNavigatingTo(null);
    }
  }, [pathname, navigatingTo]);

  const loginMutation = useMutation<AuthResponse, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Demo login failed');
      }

      const payload: ApiResponse<AuthResponse> = await res.json();
      return payload.data!;
    },
    onSuccess: async ({ user }) => {
      // Update the current user cache
      queryClient.setQueryData<AuthUser>(['currentUser'], user);

      // Invalidate post-login route so it gets refetched
      queryClient.invalidateQueries({ queryKey: ['postLoginRoute'] });

      // Get the route (it will be cached from the invalidation above)
      const route = await fetchPostLoginRoute();
      setNavigatingTo(route);
      router.push(route);
      toast.success(`${user.fullName} logged in successfully!`);
    },
    onError: (err) => {
      toast.error('Demo login failed');
      console.error('Demo login failed:', err);
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      queryClient.removeQueries({ queryKey: ['postLoginRoute'] });
      queryClient.clear();
      router.push('/login');
    },
    onError: (err) => {
      console.error('Logout failed:', err);
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      queryClient.removeQueries({ queryKey: ['postLoginRoute'] });
      router.push('/login');
    },
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading:
      userLoading ||
      loginMutation.isPending ||
      logoutMutation.isPending ||
      Boolean(navigatingTo),
    error:
      userError?.message ||
      loginMutation.error?.message ||
      logoutMutation.error?.message ||
      null,
    handleDemoLogin: () => loginMutation.mutate(),
    logout: () => logoutMutation.mutate(),
    isLoginLoading: loginMutation.isPending || Boolean(navigatingTo),
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error?.message || null,
    logoutError: logoutMutation.error?.message || null,
    clearError: () => {
      loginMutation.reset();
      logoutMutation.reset();
    },
    refreshAuth: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['postLoginRoute'] });
    },
  };
}

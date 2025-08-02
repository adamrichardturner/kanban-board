import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthUser, AuthResponse, ApiResponse } from '@/types';

async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }
  const data: ApiResponse<AuthUser> = await res.json();
  return data.data!;
}

export function useCurrentUser() {
  return useQuery<AuthUser, Error>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
    onSuccess: ({ user }) => {
      // Update the current user cache
      queryClient.setQueryData<AuthUser>(['currentUser'], user);
      router.push('/boards');
    },
    onError: (err) => {
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
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      queryClient.clear(); // Optional: clear all queries
      router.push('/login');
    },
    onError: (err) => {
      console.error('Logout failed:', err);
      // Even if logout API fails, clear local state
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      router.push('/login');
    },
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  return {
    // User state
    user: user || null,
    isAuthenticated: !!user,
    isLoading:
      userLoading || loginMutation.isPending || logoutMutation.isPending,
    error:
      userError?.message ||
      loginMutation.error?.message ||
      logoutMutation.error?.message ||
      null,

    // Actions
    handleDemoLogin: () => loginMutation.mutate(),
    logout: () => logoutMutation.mutate(),

    // Mutation states
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error?.message || null,
    logoutError: logoutMutation.error?.message || null,

    // Utility
    clearError: () => {
      loginMutation.reset();
      logoutMutation.reset();
    },

    refreshAuth: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  };
}

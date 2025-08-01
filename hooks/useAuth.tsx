import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AuthResponse as ServerAuthResponse,
  UserResponse,
  ApiError,
} from '@/models/User.types';
import { useRouter } from 'next/navigation';

async function fetchCurrentUser(): Promise<UserResponse> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.message);
  }
  return res.json();
}

export function useCurrentUser() {
  return useQuery<UserResponse, Error>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ServerAuthResponse, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const payload: ServerAuthResponse = await res.json();
      if (!res.ok) throw new Error('Demo login failed');
      return payload;
    },
    onSuccess: ({ user, accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      queryClient.setQueryData<UserResponse>(['currentUser'], user);
      router.push('/boards');
    },
    onError: (err) => {
      console.error('Demo login failed:', err);
      alert(err.message);
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.removeQueries({ queryKey: ['currentUser'] });
  };

  return {
    handleDemoLogin: () => mutation.mutate(),
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    logout,
  };
}

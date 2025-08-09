import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import ClientBoardPage from './ClientBoardPage';

async function fetchBoard(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/boards/${id}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch board');
  const { data } = await res.json();
  return data;
}

export default async function Page({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['boards', params.id],
    queryFn: () => fetchBoard(params.id),
  });
  const state = dehydrate(queryClient);
  return (
    <HydrationBoundary state={state}>
      <ClientBoardPage boardId={params.id} />
    </HydrationBoundary>
  );
}

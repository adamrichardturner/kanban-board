import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import ClientBoardPage from './ClientBoardPage';

async function fetchBoard(id: string) {
  // Use a relative URL so Next.js forwards cookies during SSR automatically
  const res = await fetch(`/api/boards/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch board');
  const { data } = await res.json();
  return data;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['boards', id],
    queryFn: () => fetchBoard(id),
  });
  const state = dehydrate(queryClient);
  return (
    <HydrationBoundary state={state}>
      <ClientBoardPage boardId={id} />
    </HydrationBoundary>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TaskWithSubtasks } from '@/types';

export function Task({ task }: { task: TaskWithSubtasks }) {
  return (
    <Card
      className='rounded-lg border-none bg-white'
      style={{
        boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)',
      }}
    >
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardContent className='px-0'>
          {task.subtasks && task.subtasks.length > 0 && (
            <span className='text-xs text-gray-500'>
              {task.subtasks.filter((st) => st.status === 'done').length} of{' '}
              {task.subtasks.length} subtasks
            </span>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
}

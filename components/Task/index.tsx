import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TaskWithSubtasks } from '@/types';
import { TaskDetailsDialog } from '../TaskDetailsDialog';

export function Task({ task }: { task: TaskWithSubtasks }) {
  return (
    <TaskDetailsDialog
      task={task}
      trigger={
        <Card
          className='cursor-pointer rounded-lg border-none bg-white transition-transform dark:bg-[#2B2C37]'
          style={{
            boxShadow: '0 4px 6px 0 rgba(54, 78, 126, 0.10)',
          }}
        >
          <CardHeader>
            <CardTitle className='text-[#000112] dark:text-white'>
              {task.title}
            </CardTitle>
            <CardContent className='px-0'>
              {task.subtasks && task.subtasks.length > 0 && (
                <span className='text-xs text-[#828FA3]'>
                  {task.subtasks.filter((st) => st.status).length} of{' '}
                  {task.subtasks.length} subtasks
                </span>
              )}
            </CardContent>
          </CardHeader>
        </Card>
      }
    />
  );
}

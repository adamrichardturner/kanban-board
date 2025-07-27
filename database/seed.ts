import { PrismaClient, TaskStatus, SubtaskStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

import type { CreateTaskInput, CreateSubtaskInput } from '../models/Task.types';
import type { RegisterInput } from '../models/User.types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Cleanup existing demo user
  await prisma.user.deleteMany({ where: { isDemo: true } });

  // Create demo user
  const demoUserInput: RegisterInput = {
    email: 'demo@example.com',
    username: 'demouser',
    password: 'demopassword',
    fullName: 'Demo User',
  };

  const demoUser = await prisma.user.create({
    data: {
      email: demoUserInput.email,
      username: demoUserInput.username,
      passwordHash: await hash(demoUserInput.password, 10),
      fullName: demoUserInput.fullName,
      isDemo: true,
      isActive: true,
    },
  });

  // Create columns
  const [todoCol, doingCol, doneCol] = await Promise.all([
    prisma.column.create({
      data: {
        userId: demoUser.id,
        name: 'To Do',
        position: 0,
        color: '#3B82F6',
      },
    }),
    prisma.column.create({
      data: {
        userId: demoUser.id,
        name: 'In Progress',
        position: 1,
        color: '#F59E0B',
      },
    }),
    prisma.column.create({
      data: {
        userId: demoUser.id,
        name: 'Done',
        position: 2,
        color: '#10B981',
      },
    }),
  ]);

  const columnMap = {
    'To Do': todoCol.id,
    'In Progress': doingCol.id,
    Done: doneCol.id,
  };

  const taskStatuses = [TaskStatus.todo, TaskStatus.doing, TaskStatus.done];

  for (let i = 0; i < 24; i++) {
    const title = sampleTitles[i % sampleTitles.length];
    const status = taskStatuses[i % taskStatuses.length];
    const columnId = getColumnFromStatus(status, columnMap);
    const subtasks = getRandomSubtasks(title);

    const taskData: CreateTaskInput = {
      title,
      description: `Details about "${title}" task.`,
      columnId,
      priority: Math.floor(Math.random() * 4), // 0–3
      dueDate: getRandomDueDate(status),
      subtasks,
    };

    const task = await prisma.task.create({
      data: {
        userId: demoUser.id,
        title: taskData.title,
        description: taskData.description,
        columnId: taskData.columnId,
        status,
        priority: taskData.priority,
        dueDate:
          taskData.dueDate instanceof Date
            ? taskData.dueDate
            : new Date(taskData.dueDate ?? ''),
        position: i,
      },
    });

    if (taskData.subtasks) {
      await prisma.subtask.createMany({
        data: taskData.subtasks.map((sub, index) => ({
          taskId: task.id,
          title: sub.title,
          status: sub.status ?? SubtaskStatus.todo,
          position: index,
        })),
      });
    }
  }

  console.log('✅ Seeding complete with demo user, 3 columns, and 24 tasks.');
}

main()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌾 Done.');
  });

const sampleTitles = [
  'Design new logo',
  'Set up CI/CD pipeline',
  'Write blog post',
  'Fix mobile nav',
  'Add unit tests',
  'Update dependencies',
  'Create landing page',
  'Research competitors',
  'Improve SEO',
  'Refactor auth flow',
  'Upgrade database',
  'Implement dark mode',
  'Clean up codebase',
  'Create demo video',
  'Test push notifications',
  'Conduct usability testing',
  'Migrate legacy code',
  'Write release notes',
  'Build dashboard UI',
  'Integrate third-party API',
  'Accessibility improvements',
  'Run security audit',
  'Optimize images',
  'Implement i18n',
  'Plan Q3 OKRs',
];

function getRandomSubtasks(title: string): CreateSubtaskInput[] {
  const count = Math.floor(Math.random() * 4) + 2; // 2-5 subtasks
  return Array.from({ length: count }, (_, i) => ({
    title: `Subtask ${i + 1} for ${title}`,
    status: ['todo', 'doing', 'done'][
      Math.floor(Math.random() * 3)
    ] as SubtaskStatus,
  }));
}

function getRandomDueDate(status: TaskStatus): Date {
  const offset =
    status === 'done'
      ? -Math.floor(Math.random() * 5)
      : Math.floor(Math.random() * 10) + 1;
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

function getColumnFromStatus(
  status: TaskStatus,
  columnMap: Record<string, string>,
): string {
  switch (status) {
    case TaskStatus.todo:
      return columnMap['To Do'];
    case TaskStatus.doing:
      return columnMap['In Progress'];
    case TaskStatus.done:
      return columnMap['Done'];
  }
}

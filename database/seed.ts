import { PrismaClient, TaskStatus, SubtaskStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { CreateTaskInput, CreateSubtaskInput } from '../models/Task.types';
import type { RegisterInput } from '../models/User.types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Cleanup existing demo user and related data
  await prisma.user.deleteMany({ where: { isDemo: true } });

  // Create demo user
  const demoUserInput: RegisterInput = {
    email: 'demo@example.com',
    username: 'demouser',
    password: 'demo123',
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

  // Create default board for demo user
  const demoBoard = await prisma.board.create({
    data: {
      userId: demoUser.id,
      name: 'Demo Project Board',
      description: 'A sample board with demo tasks and workflows',
      color: '#3B82F6',
      isDefault: true,
      position: 1,
    },
  });

  // Create additional boards for variety
  const marketingBoard = await prisma.board.create({
    data: {
      userId: demoUser.id,
      name: 'Marketing Campaign',
      description: 'Marketing initiatives and campaigns',
      color: '#F59E0B',
      isDefault: false,
      position: 2,
    },
  });

  const developmentBoard = await prisma.board.create({
    data: {
      userId: demoUser.id,
      name: 'Development Sprint',
      description: 'Current development tasks and features',
      color: '#10B981',
      isDefault: false,
      position: 3,
    },
  });

  // Create columns for demo board
  const [todoCol, doingCol, reviewCol, doneCol] = await Promise.all([
    prisma.column.create({
      data: {
        boardId: demoBoard.id,
        name: 'To Do',
        position: 1,
        color: '#6B7280',
      },
    }),
    prisma.column.create({
      data: {
        boardId: demoBoard.id,
        name: 'In Progress',
        position: 2,
        color: '#F59E0B',
      },
    }),
    prisma.column.create({
      data: {
        boardId: demoBoard.id,
        name: 'Review',
        position: 3,
        color: '#8B5CF6',
      },
    }),
    prisma.column.create({
      data: {
        boardId: demoBoard.id,
        name: 'Done',
        position: 4,
        color: '#10B981',
      },
    }),
  ]);

  // Create columns for marketing board
  const [marketingBacklog, marketingInProgress, marketingLaunched] =
    await Promise.all([
      prisma.column.create({
        data: {
          boardId: marketingBoard.id,
          name: 'Backlog',
          position: 1,
          color: '#6B7280',
        },
      }),
      prisma.column.create({
        data: {
          boardId: marketingBoard.id,
          name: 'In Progress',
          position: 2,
          color: '#F59E0B',
        },
      }),
      prisma.column.create({
        data: {
          boardId: marketingBoard.id,
          name: 'Launched',
          position: 3,
          color: '#10B981',
        },
      }),
    ]);

  // Create columns for development board
  const [devTodo, devDoing, devTesting, devDeployed] = await Promise.all([
    prisma.column.create({
      data: {
        boardId: developmentBoard.id,
        name: 'To Do',
        position: 1,
        color: '#6B7280',
      },
    }),
    prisma.column.create({
      data: {
        boardId: developmentBoard.id,
        name: 'Doing',
        position: 2,
        color: '#3B82F6',
      },
    }),
    prisma.column.create({
      data: {
        boardId: developmentBoard.id,
        name: 'Testing',
        position: 3,
        color: '#8B5CF6',
      },
    }),
    prisma.column.create({
      data: {
        boardId: developmentBoard.id,
        name: 'Deployed',
        position: 4,
        color: '#10B981',
      },
    }),
  ]);

  // Column maps for different boards
  const demoColumnMap = {
    'To Do': todoCol.id,
    'In Progress': doingCol.id,
    Review: reviewCol.id,
    Done: doneCol.id,
  };

  const marketingColumnMap = {
    Backlog: marketingBacklog.id,
    'In Progress': marketingInProgress.id,
    Launched: marketingLaunched.id,
  };

  const devColumnMap = {
    'To Do': devTodo.id,
    Doing: devDoing.id,
    Testing: devTesting.id,
    Deployed: devDeployed.id,
  };

  const taskStatuses = [TaskStatus.todo, TaskStatus.doing, TaskStatus.done];

  // Create tasks for demo board
  for (let i = 0; i < 16; i++) {
    const title = sampleTitles[i % sampleTitles.length];
    const status = taskStatuses[i % taskStatuses.length];
    const columnId = getColumnFromStatus(status, demoColumnMap);
    const subtasks = getRandomSubtasks(title);

    const taskData: CreateTaskInput = {
      boardId: demoBoard.id,
      title,
      description: `Details about "${title}" task.`,
      columnId,
      priority: Math.floor(Math.random() * 4), // 0–3
      dueDate: getRandomDueDate(status),
      subtasks,
    };

    const task = await prisma.task.create({
      data: {
        boardId: taskData.boardId,
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

  // Create tasks for marketing board
  for (let i = 0; i < 8; i++) {
    const title = marketingTasks[i % marketingTasks.length];
    const status = taskStatuses[i % taskStatuses.length];
    const columnId = getMarketingColumnFromStatus(status, marketingColumnMap);

    const task = await prisma.task.create({
      data: {
        boardId: marketingBoard.id,
        title,
        description: `Marketing task: ${title}`,
        columnId,
        status,
        priority: Math.floor(Math.random() * 4),
        dueDate: getRandomDueDate(status),
        position: i,
      },
    });

    // Add some subtasks to marketing tasks
    if (Math.random() > 0.5) {
      const subtaskCount = Math.floor(Math.random() * 3) + 1;
      await prisma.subtask.createMany({
        data: Array.from({ length: subtaskCount }, (_, index) => ({
          taskId: task.id,
          title: `Marketing subtask ${index + 1} for ${title}`,
          status: [SubtaskStatus.todo, SubtaskStatus.doing, SubtaskStatus.done][
            Math.floor(Math.random() * 3)
          ],
          position: index,
        })),
      });
    }
  }

  // Create tasks for development board
  for (let i = 0; i < 12; i++) {
    const title = developmentTasks[i % developmentTasks.length];
    const status = taskStatuses[i % taskStatuses.length];
    const columnId = getDevColumnFromStatus(status, devColumnMap);

    const task = await prisma.task.create({
      data: {
        boardId: developmentBoard.id,
        title,
        description: `Development task: ${title}`,
        columnId,
        status,
        priority: Math.floor(Math.random() * 4),
        dueDate: getRandomDueDate(status),
        position: i,
      },
    });

    // Add subtasks to development tasks
    const subtaskCount = Math.floor(Math.random() * 4) + 2;
    await prisma.subtask.createMany({
      data: Array.from({ length: subtaskCount }, (_, index) => ({
        taskId: task.id,
        title: `Dev subtask ${index + 1}: ${title}`,
        status: [SubtaskStatus.todo, SubtaskStatus.doing, SubtaskStatus.done][
          Math.floor(Math.random() * 3)
        ],
        position: index,
      })),
    });
  }

  console.log('✅ Seeding complete!');
  console.log('📊 Created:');
  console.log('  - 1 demo user');
  console.log(
    '  - 3 boards (Demo Project, Marketing Campaign, Development Sprint)',
  );
  console.log('  - 11 columns across all boards');
  console.log('  - 36 tasks across all boards');
  console.log('  - Multiple subtasks');
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
];

const marketingTasks = [
  'Launch social media campaign',
  'Create email newsletter',
  'Design promotional banners',
  'Analyze competitor pricing',
  'Plan influencer partnerships',
  'Write press release',
  'Update website copy',
  'Create product demo video',
];

const developmentTasks = [
  'Implement user authentication',
  'Build REST API endpoints',
  'Add database migrations',
  'Write integration tests',
  'Optimize query performance',
  'Setup monitoring alerts',
  'Implement caching layer',
  'Add error tracking',
  'Create admin dashboard',
  'Build mobile responsive UI',
  'Add search functionality',
  'Implement file uploads',
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

function getMarketingColumnFromStatus(
  status: TaskStatus,
  columnMap: Record<string, string>,
): string {
  switch (status) {
    case TaskStatus.todo:
      return columnMap['Backlog'];
    case TaskStatus.doing:
      return columnMap['In Progress'];
    case TaskStatus.done:
      return columnMap['Launched'];
  }
}

function getDevColumnFromStatus(
  status: TaskStatus,
  columnMap: Record<string, string>,
): string {
  switch (status) {
    case TaskStatus.todo:
      return columnMap['To Do'];
    case TaskStatus.doing:
      return columnMap['Doing'];
    case TaskStatus.done:
      return columnMap['Deployed'];
  }
}

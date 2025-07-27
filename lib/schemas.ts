import { z } from 'zod';

//––– UUID –––
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//––– Enums –––
export const taskStatusEnum = z.enum(['todo', 'doing', 'done']);
export const subtaskStatusEnum = z.enum(['todo', 'doing', 'done']);

//––– Auth schemas –––
export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

//––– Task schemas –––
export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  columnId: z.uuid().refine((val) => uuidRegex.test(val), {
    message: 'Invalid column ID format',
  }),
  priority: z.number().int().min(0).optional(),
  dueDate: z.coerce.date().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        status: subtaskStatusEnum.optional(),
      }),
    )
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: z.number().int().min(0).optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1),
  status: subtaskStatusEnum.optional(),
});

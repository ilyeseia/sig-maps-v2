import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Min 2 characters'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});


/**
 * Shared validation rules (zod). PasswordRule: at least 8 characters, letters and numbers.
 */
import { z } from 'zod';

export const PasswordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(100)
  .refine(p => /[A-Za-z]/.test(p) && /\d/.test(p), 'Password must contain letters and numbers.');

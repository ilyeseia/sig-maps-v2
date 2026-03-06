import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const sanitizeString = (str: string): string => {
  return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

const sanitizeHTML = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeHTML(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[sanitizeString(key)] = sanitizeHTML(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeHTML(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeHTML(req.query);
  }
  next();
};

export const emailSchema = z.string().email('Invalid email format').trim();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): { valid: boolean; errors?: string[] } => {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => e.message)
      };
    }
    return { valid: false, errors: ['Password validation failed'] };
  }
};

export const sanitizeTextField = (value: any, maxLength = 1000): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return sanitizeString(value.substring(0, maxLength));
};

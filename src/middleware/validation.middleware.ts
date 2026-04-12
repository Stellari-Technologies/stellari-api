/**
 * VALIDATION MIDDLEWARE
 * 
 * Validates request body against Zod schemas.
 * 
 * USAGE:
 *   1. Define schema:    const createUserSchema = z.object({ name: z.string(), ... })
 *   2. Add middleware:   router.post('/users', validateRequest(createUserSchema), controller.create);
 *   3. In controller:    const validated = req.body; // Already validated and typed
 * 
 * ERRORS:
 *   - Validation errors throw AppError with 400 status
 *   - Error middleware catches and returns standardized response
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

/**
 * validateRequest - Middleware factory for Zod validation
 * 
 * @example
 *   const schema = z.object({
 *     name: z.string().min(1),
 *     email: z.string().email(),
 *   });
 *   router.post('/users', validateRequest(schema), controller.create);
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace body with validated+typed data
      next();
    } catch (error: any) {
      const issues = error.issues || [];
      const message = issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        message || 'Validation failed',
        ERROR_CODES.INVALID_INPUT,
      );
    }
  };
};

/**
 * ERROR MIDDLEWARE
 * 
 * Handles all errors thrown in controllers/services and converts them to HTTP responses.
 * 
 * USAGE:
 *   1. Throw errors in services: throw new AppError(400, 'User not found', 'USER_NOT_FOUND')
 *   2. Pass to middleware:       catch(error) { next(error); }
 *   3. Middleware handles:       Logs error + returns standardized response
 * 
 * RESPONSE FORMAT:
 *   {
 *     "success": false,
 *     "error": "Error message",
 *     "code": "ERROR_CODE",
 *     "timestamp": "2026-04-12T10:30:00.000Z"
 *   }
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * AppError - Standardized error class for HTTP responses
 * 
 * @example
 *   throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
 *   throw new AppError(400, 'Invalid email format', 'INVALID_INPUT');
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * errorHandler - Express error middleware
 * Add to app in src/index.ts as: app.use(errorHandler);
 */
export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  // Log all errors
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
};

/**
 * LOGGER UTILITY - Winston Logging Setup
 * 
 * WHAT IS THIS?
 * - Centralized logging for entire application
 * - Records errors, important events, and activities
 * - Outputs to console (dev) and files (production)
 * - Helps debug problems in production
 * 
 * WHERE LOGS GO?
 * 
 * Development (NODE_ENV !== 'production'):
 *   - Console output (colorized, human-readable)
 * 
 * Production:
 *   - error.log     → All ERROR level logs
 *   - combined.log  → All logs (info, error, debug, etc)
 * 
 * USAGE:
 * 
 *   import { logger } from '../utils/logger';
 * 
 *   // Log errors (caught in error middleware)
 *   logger.error({ message: 'User not found', userId: '123' });
 * 
 *   // Log warnings
 *   logger.warn('Deprecated endpoint called');
 * 
 *   // Log info
 *   logger.info('Server started on port 3000');
 * 
 *   // Log debug (only visible if LOG_LEVEL=debug)
 *   logger.debug('Database query executed', { query: '...' });
 * 
 * LOG LEVELS (in order of severity):
 * 
 *   error   → Critical failures that need immediate attention
 *   warn    → Something unexpected happened, but system keeps running
 *   info    → Important milestones (startup, requests)
 *   debug   → Detailed information for troubleshooting
 * 
 * CONFIGURE LOG LEVEL:
 * 
 *   In .env: LOG_LEVEL=debug   # Will log everything
 *   In .env: LOG_LEVEL=error   # Only errors
 *   Default: LOG_LEVEL=info
 */

import winston from 'winston';

/**
 * Configure Winston Logger
 * - Outputs to files in production
 * - Outputs to console in development
 * - Includes timestamps and stack traces
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'stellari-api' },
  transports: [
    // Always write errors to error.log
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// In development, also log to console (colorized)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

/**
 * Helper: Log HTTP requests (optional)
 * 
 * @example
 *   logRequest('GET', '/api/users', 200);
 */
export const logRequest = (method: string, path: string, statusCode: number) => {
  logger.info(`${method} ${path} - ${statusCode}`);
};

/**
 * Helper: Log errors with context
 * 
 * @example
 *   try {
 *     await userService.findById(userId);
 *   } catch (error) {
 *     logError(error, `UserController.findById userId=${userId}`);
 *   }
 */
export const logError = (error: Error, context?: string) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context,
  });
};

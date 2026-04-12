/**
 * ============================================================================
 * CONSTANTS FILE - Centralized Configuration Values
 * ============================================================================
 * 
 * WHAT IS THIS FILE?
 * - Stores constant values used throughout the application
 * - Prevents magic numbers and magic strings scattered in code
 * - Single source of truth for HTTP codes, error messages, status values, etc.
 * - Improves code maintainability and reduces bugs
 * 
 * WHY USE CONSTANTS?
 * 
 * WITHOUT constants (BAD):
 *   if (res.status === 201) { ... }          // Magic number!
 *   if (error.code === 'INVALID_INPUT') { .. } // Magic string!
 *   const status = 'pending';                 // String in multiple places
 * 
 * WITH constants (GOOD):
 *   if (res.status === HTTP_STATUS.CREATED) { ... }
 *   if (error.code === ERROR_CODES.INVALID_INPUT) { ... }
 *   const status = CLAIM_STATUS.PENDING;     // Single source of truth
 * 
 * ============================================================================
 * WHERE IT'S USED
 * ============================================================================
 * 
 * Controllers:
 *   import { HTTP_STATUS, ERROR_CODES } from '../constants';
 *   res.status(HTTP_STATUS.OK).json({ ... });
 * 
 * Middleware:
 *   import { HTTP_STATUS } from '../constants';
 *   res.status(HTTP_STATUS.BAD_REQUEST).json({ ... });
 * 
 * Services:
 *   import { ERROR_CODES } from '../constants';
 *   throw new AppError(HTTP_STATUS.NOT_FOUND, 'Item not found', ERROR_CODES.NOT_FOUND);
 * 
 * Tests:
 *   import { HTTP_STATUS } from '../constants';
 *   expect(response.status).toBe(HTTP_STATUS.CREATED);
 * 
 * ============================================================================
 * HOW TO ADD NEW CONSTANTS
 * ============================================================================
 * 
 * PATTERN 1: Simple Enum-like Constants
 * For your domain (e.g., reward, claim, order status):
 * 
 *   export const CLAIM_STATUS = {
 *     PENDING: 'pending',
 *     APPROVED: 'approved',
 *     REJECTED: 'rejected',
 *   } as const;
 * 
 *   // Usage:
 *   import { CLAIM_STATUS } from '../constants';
 *   const status = CLAIM_STATUS.PENDING;  // 'pending'
 * 
 * PATTERN 2: Numeric Constants
 * For pagination, timeouts, limits:
 * 
 *   export const LIMITS = {
 *     PAGE_SIZE: 20,
 *     MAX_ITEMS: 1000,
 *     REQUEST_TIMEOUT_MS: 30000,
 *     PASSWORD_MIN_LENGTH: 8,
 *   } as const;
 * 
 *   // Usage:
 *   import { LIMITS } from '../constants';
 *   const items = await getItems({ limit: LIMITS.PAGE_SIZE });
 * 
 * PATTERN 3: Message Templates
 * For consistent error/success messages:
 * 
 *   export const MESSAGES = {
 *     SUCCESS: 'Operation completed successfully',
 *     NOT_FOUND: 'Resource not found',
 *     INVALID_EMAIL: 'Invalid email address format',
 *     UNAUTHORIZED: 'You do not have permission to access this resource',
 *   } as const;
 * 
 *   // Usage:
 *   throw new AppError(HTTP_STATUS.NOT_FOUND, MESSAGES.NOT_FOUND);
 * 
 * ============================================================================
 * EXISTING CONSTANTS REFERENCE
 * ============================================================================
 * 
 * HTTP_STATUS
 * Used to set HTTP response status codes
 * 
 *   res.status(HTTP_STATUS.OK).json(data);
 *   res.status(HTTP_STATUS.CREATED).json(newItem);
 *   res.status(HTTP_STATUS.BAD_REQUEST).json(errors);
 * 
 * ERROR_CODES
 * Machine-readable error identifiers for API consumers
 * 
 *   {
 *     "success": false,
 *     "error": "Item not found",
 *     "code": "NOT_FOUND"  ← For programmatic handling
 *   }
 * 
 * ============================================================================
 * BEST PRACTICES
 * ============================================================================
 * 
 * 1. USE UPPERCASE_WITH_UNDERSCORES for constant names
 * 2. GROUP RELATED CONSTANTS - Keep related values together
 * 3. USE 'as const' - TypeScript will infer exact literal types
 * 4. IMPORT WHAT YOU NEED - Don't import entire object if only needing one value
 * 5. ADD COMMENTS - Explain what each enum means
 * 6. AVOID DUPLICATES - Don't hardcode the same value elsewhere
 * 
 * ============================================================================
 * EXAMPLES OF WHAT TO ADD FOR YOUR FEATURES
 * ============================================================================
 * 
 * EXAMPLE: Reward Feature
 * 
 *   export const REWARD_STATUS = {
 *     ACTIVE: 'active',
 *     EXPIRED: 'expired',
 *     CLAIMED: 'claimed',
 *   } as const;
 * 
 *   export const REWARD_LIMITS = {
 *     MIN_AMOUNT: 0.01,
 *     MAX_AMOUNT: 9999.99,
 *     MAX_EXPIRY_DAYS: 365,
 *   } as const;
 * 
 * EXAMPLE: User Feature
 * 
 *   export const ROLE = {
 *     ADMIN: 'admin',
 *     USER: 'user',
 *     GUEST: 'guest',
 *   } as const;
 * 
 *   export const USER_LIMITS = {
 *     MIN_NAME_LENGTH: 2,
 *     MAX_NAME_LENGTH: 100,
 *   } as const;
 * 
 * ============================================================================
 */

/**
 * HTTP_STATUS
 * 
 * Standard HTTP response status codes.
 * Use these instead of magic numbers in controllers.
 * 
 * @example
 *   res.status(HTTP_STATUS.OK).json(data);
 *   res.status(HTTP_STATUS.CREATED).json(newItem);
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * ERROR_CODES
 * 
 * Machine-readable error codes for API responses.
 * Allows clients to handle errors programmatically without parsing error messages.
 * Always pair with HTTP_STATUS and a human-readable error message.
 * 
 * @example
 *   throw new AppError(
 *     HTTP_STATUS.NOT_FOUND,
 *     'Item not found',
 *     ERROR_CODES.NOT_FOUND
 *   );
 * Response:
 *   {
 *     "success": false,
 *     "error": "Item not found",
 *     "code": "NOT_FOUND",
 *     "timestamp": "2026-04-12T10:30:00Z"
 *   }
 */
export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// ADD YOUR DOMAIN-SPECIFIC CONSTANTS BELOW
// ============================================================================

// EXAMPLE: Uncomment and use for your features
// 
// export const CLAIM_STATUS = {
//   PENDING: 'pending',
//   APPROVED: 'approved',
//   REJECTED: 'rejected',
// } as const;
// 
// export const FEATURE_LIMITS = {
//   MAX_ITEMS_PER_PAGE: 50,
//   MIN_AMOUNT: 0.01,
//   MAX_AMOUNT: 999999.99,
// } as const;
// 
// export const MESSAGES = {
//   ITEM_CREATED: 'Item created successfully',
//   ITEM_NOT_FOUND: 'Item not found',
//   INVALID_EMAIL: 'Invalid email format',
// } as const;

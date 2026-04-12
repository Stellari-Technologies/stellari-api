/**
 * VALIDATORS - Zod Request Validation Schemas
 * 
 * WHAT IS THIS?
 * - Central location for all request body validation schemas
 * - Uses Zod for type-safe validation
 * - Defines EXACTLY what shape client requests must have
 * - Rejects invalid requests before they reach controllers
 * 
 * WHY ZODE YOU NEED THIS?
 * 1. Security - Reject malformed/malicious requests early
 * 2. Type Safety - Validate AND get TypeScript types automatically
 * 3. Error Messages - Return helpful validation errors to clients
 * 4. Consistency - All endpoints have same validation patterns
 * 
 * HOW IT WORKS:
 * 
 *   Client sends:      { "name": "John" }
 *        ↓
 *   Middleware calls:  schema.parse(req.body)
 *        ↓
 *   Valid? Yes → Pass to controller with typed data
 *   Valid? No  → Throw error → Error middleware returns 400 + error message
 * 
 * VALIDATION RULES AVAILABLE:
 * 
 *   z.string()                    → String type
 *   .min(3)                       → Minimum 3 characters
 *   .max(255)                     → Maximum 255 characters
 *   .email()                      → Must be valid email format
 *   .url()                        → Must be valid URL
 *   .regex(/pattern/)             → Must match regex pattern
 *   .optional()                   → Allowed to be missing
 *   .nullable()                   → Allowed to be null
 *   .default('value')             → Default if not provided
 *   
 *   z.number()                    → Number type
 *   .positive()                   → Must be > 0
 *   .min(0)                       → Minimum value
 *   .max(100)                     → Maximum value
 *   .int()                        → Must be integer
 *   
 *   z.enum(['A', 'B'])            → Must be one of these values
 *   z.date()                      → Date type
 *   z.boolean()                   → Boolean type
 * 
 * USAGE PATTERN:
 * 
 *   // In routes (src/index.ts):
 *   router.post(
 *     '/:organizationId/users',
 *     validateRequest(createUserSchema),  // ← Middleware validates
 *     userController.create                // ← Only valid data reaches here
 *   );
 * 
 *   // In controller:
 *   create = async (req: Request, res: Response, next: NextFunction) => {
 *     // req.body is now guaranteed to match CreateUserInput type
 *     const validated: CreateUserInput = req.body;
 *     const user = await this.service.create(req.params.organizationId, validated);
 *     res.json({ success: true, data: user });
 *   };
 * 
 * CREATE SCHEMA PATTERN:
 * 
 *   export const createUserSchema = z.object({
 *     name: z.string().min(1).max(255),
 *     email: z.string().email('Invalid email format'),
 *     password: z.string().min(8, 'Password must be at least 8 characters'),
 *     role: z.enum(['ADMIN', 'USER']).default('USER'),
 *   });
 * 
 *   export type CreateUserInput = z.infer<typeof createUserSchema>;
 * 
 * UPDATE SCHEMA PATTERN (all fields optional):
 * 
 *   export const updateUserSchema = z.object({
 *     name: z.string().min(1).max(255).optional(),
 *     email: z.string().email().optional(),
 *     role: z.enum(['ADMIN', 'USER']).optional(),
 *   });
 * 
 *   export type UpdateUserInput = z.infer<typeof updateUserSchema>;
 */

import { z } from 'zod';

/**
 * ============================================================================
 * TEMPLATE SCHEMAS - Replace with your actual schemas
 * ============================================================================
 */

/**
 * Create validation schema - All required fields
 * 
 * @example
 *   POST /api/users
 *   { "name": "John", "description": "..." }
 */
export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
});

/**
 * Update validation schema - All fields optional
 * 
 * @example
 *   PATCH /api/users/123
 *   { "name": "Jane" }  // Only updating name
 */
export const updateItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  description: z.string().optional(),
});

// Extract TypeScript types from schemas
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

/**
 * ============================================================================
 * EXAMPLE - Full User Validation (Uncomment to use)
 * ============================================================================
 */

/*

// Create user - all fields required
export const createUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name too long'),
  
  email: z.string()
    .email('Invalid email format'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  
  role: z.enum(['ADMIN', 'USER', 'GUEST'])
    .default('USER'),
});

// Update user - all fields optional
export const updateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .optional(),
  
  email: z.string()
    .email('Invalid email format')
    .optional(),
  
  role: z.enum(['ADMIN', 'USER', 'GUEST'])
    .optional(),
});

// Extract types for controller usage
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// USAGE IN ROUTES:
//
// import { validateRequest } from '../middleware/validation.middleware';
// 
// router.post(
//   '/:organizationId/users',
//   validateRequest(createUserSchema),
//   userController.create
// );
//
// router.patch(
//   '/:organizationId/users/:id',
//   validateRequest(updateUserSchema),
//   userController.update
// );

*/


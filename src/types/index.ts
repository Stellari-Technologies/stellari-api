/**
 * TYPES FILE - Centralized TypeScript Interfaces
 * 
 * WHAT IS THIS?
 * - Single location for all reusable TypeScript interfaces and types
 * - Ensures consistent response formats across entire API
 * - Used in controllers, services, middleware
 * - Makes frontend integration easier (same types for both backend + frontend)
 * 
 * WHAT GOES HERE?
 * 
 * ✅ API Response & Pagination formats
 * ✅ Entity DTOs (Data Transfer Objects) - what API returns
 * ✅ Request input types - what API accepts
 * ✅ Query parameters types
 * ✅ Common enums (UserRole, OrderStatus, etc)
 * ✅ Shared generic types
 * 
 * ❌ Don't put entity definitions here (they go in entities/)
 * ❌ Don't put service-specific types (keep in service file)
 * ❌ Don't put middleware-specific types (keep in middleware file)
 * 
 * USAGE PATTERN:
 * 
 *   import { ApiResponse, PaginatedResponse } from '../types';
 * 
 *   // In controllers:
 *   res.json<ApiResponse<User>>({ success: true, data: user, ... });
 * 
 *   // In services:
 *   async findAll(): Promise<PaginatedResponse<User>> { ... }
 * 
 * EXAMPLES:
 * 
 *   // Entity DTO (what API returns)
 *   export interface UserDTO {
 *     id: string;
 *     name: string;
 *     email: string;
 *     createdAt: string;
 *   }
 * 
 *   // Request input type
 *   export interface CreateUserInput {
 *     name: string;
 *     email: string;
 *     password: string;
 *   }
 * 
 *   // Enum for status
 *   export enum OrderStatus {
 *     PENDING = 'PENDING',
 *     FULFILLED = 'FULFILLED',
 *     CANCELLED = 'CANCELLED',
 *   }
 * 
 *   // Query params type
 *   export interface ListQueryParams {
 *     page?: number;
 *     limit?: number;
 *     sort?: 'asc' | 'desc';
 *   }
 */

/**
 * Standard API Response - Used for single item responses
 * 
 * @example
 *   res.json<ApiResponse<User>>({
 *     success: true,
 *     data: { id: '123', name: 'John', email: 'john@example.com' },
 *     timestamp: new Date().toISOString(),
 *   });
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Paginated Response - Used for list endpoints
 * Always includes meta with pagination info
 * 
 * @example
 *   res.json<PaginatedResponse<User>>({
 *     success: true,
 *     data: [{ id: '1', name: 'John', ... }, ...],
 *     meta: { page: 1, limit: 20, total: 156, pages: 8 },
 *     timestamp: new Date().toISOString(),
 *   });
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

// ============================================================================
// ADD YOUR CUSTOM TYPES BELOW
// ============================================================================

// ENTITY DTOs - What the API returns to clients
// export interface UserDTO {
//   id: string;
//   name: string;
//   email: string;
//   createdAt: string;
// }

// REQUEST INPUTS - What clients send to the API
// export interface CreateUserInput {
//   name: string;
//   email: string;
//   password: string;
// }

// export interface UpdateUserInput {
//   name?: string;
//   email?: string;
// }

// ENUMS - Predefined values
// export enum UserRole {
//   ADMIN = 'ADMIN',
//   MEMBER = 'MEMBER',
//   GUEST = 'GUEST',
// }

// export enum OrderStatus {
//   PENDING = 'PENDING',
//   FULFILLED = 'FULFILLED',
//   CANCELLED = 'CANCELLED',
// }

// QUERY PARAMETERS
// export interface ListQueryParams {
//   page?: number;
//   limit?: number;
//   sort?: 'asc' | 'desc';
//   search?: string;
// }


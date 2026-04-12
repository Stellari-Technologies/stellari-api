/**
 * SERVICE TEMPLATE - Business Logic Layer
 * 
 * WHAT IS A SERVICE?
 * - Handles all business logic (not controller, not middleware)
 * - Performs database queries via TypeORM repositories
 * - Throws errors that error middleware catches
 * - One service per resource type (UserService, RewardService, OrderService)
 * 
 * DATA FLOW:
 * 
 *   Controller receives request
 *   ↓
 *   Extracts data (params, body, query)
 *   ↓
 *   Calls Service.method(data)
 *   ↓
 *   Service queries database
 *   ↓
 *   Service throws error if invalid
 *   ↓
 *   Controller catches error and routes to error middleware
 *   ↓
 *   Error middleware returns HTTP response
 * 
 * SERVICE RESPONSIBILITIES:
 * 
 * ✅ Query database using repositories
 * ✅ Validate business logic (check if user exists, has permission, etc)
 * ✅ Throw AppError with meaningful messages
 * ✅ Return clean data to controller
 * ✅ Handle relationships between entities
 * 
 * ❌ Don't parse request data (controller does)
 * ❌ Don't format HTTP responses (controller does)
 * ❌ Don't handle HTTP status codes (error middleware does)
 * 
 * HOW TO CREATE A SERVICE:
 * 
 *   1. Copy this file:           cp template.service.ts user.service.ts
 *   2. Rename the class:          class TemplateService → class UserService
 *   3. Import your entity:        import { User } from '../entities/user';
 *   4. Get repository:            private repo = AppDataSource.getRepository(User);
 *   5. Implement methods:         Replace TODOs with database queries
 *   6. Throw errors:              throw new AppError(404, 'User not found', 'USER_NOT_FOUND')
 * 
 * EXAMPLE - UserService:
 * 
 *   export class UserService {
 *     private repo = AppDataSource.getRepository(User);
 * 
 *     async create(organizationId: string, data: CreateUserInput): Promise<User> {
 *       // Check if user email already exists
 *       const exists = await this.repo.findOne({ where: { email: data.email, organizationId } });
 *       if (exists) {
 *         throw new AppError(400, 'Email already in use', 'EMAIL_EXISTS');
 *       }
 * 
 *       // Create and save user
 *       const user = this.repo.create({ ...data, organizationId });
 *       return await this.repo.save(user);
 *     }
 * 
 *     async findById(organizationId: string, id: string): Promise<User> {
 *       const user = await this.repo.findOne({
 *         where: { id, organizationId },
 *       });
 *       if (!user) {
 *         throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
 *       }
 *       return user;
 *     }
 *   }
 */

import { AppDataSource } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../constants';

/**
 * TemplateService - CRUD template
 * Replace "Template" with your actual entity name (User, Reward, Order, etc)
 */
export class TemplateService {
  // TODO: Replace YourEntity with actual entity
  // private repo = AppDataSource.getRepository(YourEntity);

  /**
   * CREATE - Insert new record
   * Throws error if validation fails (duplicate, invalid data, etc)
   */
  async create(organizationId: string, data: any): Promise<any> {
    // TODO: Replace with actual entity creation
    // const entity = this.repo.create({ ...data, organizationId });
    // return await this.repo.save(entity);
    throw new Error('Not implemented');
  }

  /**
   * FIND BY ID - Get single record
   * Throws 404 if not found
   */
  async findById(organizationId: string, id: string): Promise<any> {
    // TODO: Query by id + organizationId for multi-tenant isolation
    // const item = await this.repo.findOne({ where: { id, organizationId } });
    // if (!item) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Not found', 'NOT_FOUND');
    // return item;
    throw new Error('Not implemented');
  }

  /**
   * FIND ALL - Get all records for organization (with pagination)
   */
  async findAll(organizationId: string, page: number = 1, limit: number = 20): Promise<any[]> {
    // TODO: Query all items for org, with pagination
    // const skip = (page - 1) * limit;
    // return await this.repo.find({ where: { organizationId }, skip, take: limit });
    throw new Error('Not implemented');
  }

  /**
   * UPDATE - Modify existing record
   * Throws 404 if not found
   */
  async update(organizationId: string, id: string, data: any): Promise<any> {
    // TODO: Find, verify ownership, update
    // const item = await this.findById(organizationId, id); // Throws 404 if not found
    // Object.assign(item, data);
    // return await this.repo.save(item);
    throw new Error('Not implemented');
  }

  /**
   * DELETE - Remove record
   * Throws 404 if not found
   */
  async delete(organizationId: string, id: string): Promise<void> {
    // TODO: Find then delete
    // const item = await this.findById(organizationId, id); // Throws 404 if not found
    // await this.repo.remove(item);
    throw new Error('Not implemented');
  }
}

/**
 * ============================================================================
 * EXAMPLE - UserService (Complete Implementation)
 * ============================================================================
 * 
 * Copy this pattern to create actual service files. Here's a working UserService:
 */

/*

import { User } from '../entities/user';

export class UserService {
  private repo = AppDataSource.getRepository(User);

  async create(organizationId: string, data: any): Promise<User> {
    // Validate: email unique per organization
    const exists = await this.repo.findOne({
      where: { email: data.email, organizationId },
    });
    if (exists) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Email already in use',
        'EMAIL_EXISTS',
      );
    }

    // Create and save
    const user = this.repo.create({ ...data, organizationId });
    return await this.repo.save(user);
  }

  async findById(organizationId: string, id: string): Promise<User> {
    // Multi-tenant safety: query by id + organizationId
    const user = await this.repo.findOne({
      where: { id, organizationId },
    });
    if (!user) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        'User not found',
        'USER_NOT_FOUND',
      );
    }
    return user;
  }

  async findAll(organizationId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    const skip = (page - 1) * limit;
    return await this.repo.find({
      where: { organizationId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async update(organizationId: string, id: string, data: any): Promise<User> {
    // findById throws 404 if not found - reuse that logic
    const user = await this.findById(organizationId, id);

    // If changing email, check for duplicates
    if (data.email && data.email !== user.email) {
      const exists = await this.repo.findOne({
        where: { email: data.email, organizationId },
      });
      if (exists) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          'Email already in use',
          'EMAIL_EXISTS',
        );
      }
    }

    // Apply changes and save
    Object.assign(user, data);
    return await this.repo.save(user);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    // findById throws 404 if not found
    const user = await this.findById(organizationId, id);
    await this.repo.remove(user);
  }
}

*/

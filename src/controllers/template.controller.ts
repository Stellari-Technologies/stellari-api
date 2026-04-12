/**
 * ============================================================================
 * CONTROLLER TEMPLATE - One Per Resource Type
 * ============================================================================
 * 
 * WHAT IS THIS?
 * - Handles HTTP requests for ONE resource type (User, Reward, Order, etc.)
 * - Extracts data from request → Calls service → Returns response
 * - Controllers are route handlers, not business logic
 * 
 * ONE CONTROLLER PER RESOURCE:
 * 
 *   UserController       → Handles GET/POST/PATCH/DELETE /users/*
 *   RewardController     → Handles GET/POST/PATCH/DELETE /rewards/*
 *   OrderController      → Handles GET/POST/PATCH/DELETE /orders/*
 * 
 * HOW TO CREATE A NEW CONTROLLER:
 * 
 *   1. Copy this file:           cp template.controller.ts user.controller.ts
 *   2. Rename the class:          class TemplateController → class UserController
 *   3. Update service import:    import { UserService } ...
 *   4. Replace TODOs with logic: await this.service.create(...)
 *   5. Add routes in src/index.ts
 * 
 * ROUTE SETUP IN src/index.ts:
 * 
 *   import { UserController } from './controllers/user.controller';
 *   
 *   const userController = new UserController();
 *   router.post('/:organizationId/users', userController.create);
 *   router.get('/:organizationId/users', userController.findAll);
 *   router.get('/:organizationId/users/:id', userController.findById);
 *   router.patch('/:organizationId/users/:id', userController.update);
 *   router.delete('/:organizationId/users/:id', userController.delete);
 * 
 * PATTERN FOR EACH METHOD:
 * 
 *   1. Extract data:      const { organizationId, id } = req.params;
 *   2. Call service:      const result = await this.service.method(...);
 *   3. Return response:   res.status(HTTP_STATUS.OK).json({ success: true, data: result });
 *   4. Error handling:    catch(error) { next(error); } → Error middleware handles it
 * 
 * RESPONSE FORMAT (always the same):
 * 
 *   {
 *     "success": true/false,
 *     "data": { ... } or [ ... ] or null,
 *     "timestamp": "2026-04-12T10:30:00.000Z"
 *   }
 * 
 * BEST PRACTICES:
 * 
 * ✅ Thin controllers - Extract, call service, return response
 * ✅ Use HTTP_STATUS - Never hardcode 200, 201, 404
 * ✅ Use error middleware - Don't catch/handle errors here, use next(error)
 * ✅ Multi-tenant - Extract organizationId from params for data isolation
 * 
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service';
import { HTTP_STATUS } from '../constants';

export class TemplateController {
  private service = new TemplateService();

  // POST /:organizationId/items - Create new item
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.params.organizationId;
      // TODO: const item = await this.service.create(organizationId, req.body);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /:organizationId/items/:id - Get single item
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, id } = req.params;
      // TODO: const item = await this.service.findById(organizationId, id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /:organizationId/items - Get all items (with pagination)
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      // TODO: const items = await this.service.findAll(organizationId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /:organizationId/items/:id - Update item
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, id } = req.params;
      // TODO: const updated = await this.service.update(organizationId, id, req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /:organizationId/items/:id - Delete item
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, id } = req.params;
      // TODO: await this.service.delete(organizationId, id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

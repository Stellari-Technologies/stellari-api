import { Request, Response, NextFunction } from "express";
import { StaffService } from "../services/staff.service";
import { HTTP_STATUS } from "../constants";

export class StaffController {
  private service = new StaffService();

  /**
   * POST /api/v1/:orgId/staff
   * Owner creates a staff account
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const result = await this.service.create(orgId, req.body);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
          },
          membership: {
            id: result.membership.id,
            userType: result.membership.userType,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/:orgId/staff
   * Get all staff members in the org
   */
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const staff = await this.service.findAll(orgId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: staff.map((membership) => ({
          userId: membership.user.id,
          firstName: membership.user.firstName,
          lastName: membership.user.lastName,
          email: membership.user.email,
          membershipId: membership.id,
          userType: membership.userType,
          joinedAt: membership.createdAt,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/:orgId/staff/:userId
   * Get one staff member
   */
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, userId } = req.params;
      const membership = await this.service.findById(orgId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          userId: membership.user.id,
          firstName: membership.user.firstName,
          lastName: membership.user.lastName,
          email: membership.user.email,
          membershipId: membership.id,
          userType: membership.userType,
          joinedAt: membership.createdAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/:orgId/staff/:userId
   * Remove a staff member from the org
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, userId } = req.params;
      await this.service.delete(orgId, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Staff member removed successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from "express";
import { ActivityService } from "../services/activity.service";
import { HTTP_STATUS } from "../constants";

export class ActivityController {
  private service = new ActivityService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const activity = await this.service.create(orgId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: activity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const activities = await this.service.findAll(orgId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: activities,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, activityId } = req.params;
      const activity = await this.service.findById(orgId, activityId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: activity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, activityId } = req.params;
      const activity = await this.service.update(orgId, activityId, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: activity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, activityId } = req.params;
      await this.service.delete(orgId, activityId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Activity deactivated successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

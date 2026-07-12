import { Request, Response, NextFunction } from "express";
import { RewardService } from "../services/reward.service";
import { HTTP_STATUS } from "../constants";

export class RewardController {
  private service = new RewardService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const reward = await this.service.create(orgId, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: reward,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const rewards = await this.service.findAll(orgId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: rewards,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, rewardId } = req.params;
      const reward = await this.service.findById(orgId, rewardId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: reward,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, rewardId } = req.params;
      const reward = await this.service.update(orgId, rewardId, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: reward,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, rewardId } = req.params;
      await this.service.delete(orgId, rewardId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Reward deactivated successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { HTTP_STATUS } from "../constants";

export class TransactionController {
  private service = new TransactionService();

  /**
   * POST /api/v1/:orgId/participants/:participantId/transactions/activity
   * Staff completes an activity for a participant — earns currency
   */
  completeActivity = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { orgId, participantId } = req.params;
      const { activityId } = req.body;

      const result = await this.service.completeActivity(
        orgId,
        participantId,
        activityId,
        req.user!,
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          transaction: result.transaction,
          newBalance: result.newBalance,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/:orgId/participants/:participantId/transactions/reward
   * Staff redeems a reward for a participant — spends currency
   */
  redeemReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, participantId } = req.params;
      const { rewardId } = req.body;

      const result = await this.service.redeemReward(
        orgId,
        participantId,
        rewardId,
        req.user!,
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          transaction: result.transaction,
          newBalance: result.newBalance,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/:orgId/participants/:participantId/transactions
   * Get full transaction history + current balance
   */
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, participantId } = req.params;

      const result = await this.service.getHistory(orgId, participantId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          transactions: result.transactions,
          currentBalance: result.currentBalance,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

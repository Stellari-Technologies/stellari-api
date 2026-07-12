import { Request, Response, NextFunction } from "express";
import { ParticipantService } from "../services/participant.service";
import { HTTP_STATUS } from "../constants";

export class ParticipantController {
  private service = new ParticipantService();

  /**
   * POST /api/v1/:orgId/participants
   * Create a new participant
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const participant = await this.service.create(orgId, req.body);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: participant,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/:orgId/participants
   * Get all participants in the org
   */
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const participants = await this.service.findAll(orgId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: participants,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/:orgId/participants/:participantId
   * Get one participant
   */
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, participantId } = req.params;
      const participant = await this.service.findById(orgId, participantId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: participant,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/:orgId/participants/:participantId
   * Update participant details
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, participantId } = req.params;
      const participant = await this.service.update(
        orgId,
        participantId,
        req.body,
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: participant,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/:orgId/participants/:participantId
   * Remove a participant
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, participantId } = req.params;
      await this.service.delete(orgId, participantId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Participant deleted successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

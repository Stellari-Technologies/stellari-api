import { Request, Response, NextFunction } from "express";
import { InviteService } from "../services/invite.service";
import { HTTP_STATUS } from "../constants";

export class InviteController {
  private service = new InviteService();

  /**
   * POST /api/v1/:orgId/invitations
   * Owner sends an invite to a staff member
   */
  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const { email, role } = req.body;

      const invitation = await this.service.sendInvite(
        orgId,
        email,
        req.user!,
        role,
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        },
        message: "Invitation sent successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/invitations/:token
   * Get invitation details by token
   * Called when staff clicks the invite link
   */
  getByToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const invitation = await this.service.getByToken(token);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          email: invitation.email,
          organizationName: invitation.organization.organizationName,
          expiresAt: invitation.expiresAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/invitations/:token/accept
   * Staff accepts invite after logging in via Cognito
   */
  accept = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { firstName, lastName, role } = req.body; // ← email removed from body
      const email = req.user!.email; // ← from verified Cognito token
      const result = await this.service.acceptInvite(
        token,
        req.user!.cognitoSub!,
        email,
        firstName,
        lastName,
        role,
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
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
}

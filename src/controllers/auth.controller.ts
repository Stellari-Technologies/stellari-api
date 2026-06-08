/**
 * AuthController
 * Handles POST /api/v1/auth/setup
 */
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { HTTP_STATUS } from "../constants";

export class AuthController {
  private service = new AuthService();

  /**
   * POST /api/v1/auth/setup
   * Called after owner signs up and verifies email via Cognito.
   * Creates org and links owner as account_owner.
   */
  setup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName, organizationType } = req.body;

      // req.user is set by requireAuth middleware
      // contains the verified Cognito user
      const cognitoSub = req.user!.cognitoSub!;
      const email = req.user!.email;

      const result = await this.service.setupOrganization(cognitoSub, email, {
        organizationName,
        organizationType,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
          },
          organization: {
            id: result.organization.id,
            organizationName: result.organization.organizationName,
            organizationType: result.organization.organizationType,
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

import { AppDataSource } from "../config/database";
import { Invitation, InvitationStatus } from "../entities/Invitation";
import { User } from "../entities/User";
import {
  OrganizationMembership,
  UserType,
} from "../entities/OrganizationMembership";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";
import { randomBytes } from "crypto";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || "us-west-2",
});

export class InviteService {
  private invitationRepo = AppDataSource.getRepository(Invitation);
  private userRepo = AppDataSource.getRepository(User);
  private membershipRepo = AppDataSource.getRepository(OrganizationMembership);

  /**
   * Send an invite to a staff member
   * Creates an Invitation row and calls Cognito adminCreateUser()
   */
  async sendInvite(
    organizationId: string,
    email: string,
    createdBy: User,
  ): Promise<Invitation> {
    // check if already invited or already a member
    const existingInvite = await this.invitationRepo.findOne({
      where: {
        email,
        organizationId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvite) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "An invitation has already been sent to this email",
        ERROR_CODES.CONFLICT,
      );
    }

    // generate unique token for the invite link
    const token = randomBytes(32).toString("hex");

    // set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // create Cognito account for staff
    // Cognito will send them a temp password via email
    try {
      await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID!,
          Username: email,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" },
          ],
          DesiredDeliveryMediums: ["EMAIL"],
        }),
      );
    } catch (error: any) {
      // if user already exists in Cognito that's okay
      if (error.name !== "UsernameExistsException") {
        throw new AppError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to create Cognito account for staff",
          ERROR_CODES.INTERNAL_ERROR,
        );
      }
    }

    // create invitation row
    const invitation = this.invitationRepo.create({
      email,
      token,
      organizationId,
      status: InvitationStatus.PENDING,
      expiresAt,
      createdBy,
      createdById: createdBy.id,
      organization: { id: organizationId },
    });

    await this.invitationRepo.save(invitation);

    // log the invite link for now
    // replace with SES email when available
    console.log(`
    ====================================
    INVITE LINK FOR ${email}:
    http://localhost:3000/api/v1/invitations/${token}/accept
    ====================================
    `);

    return invitation;
  }

  /**
   * Get invitation by token
   * Used when staff clicks the invite link
   */
  async getByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepo.findOne({
      where: { token },
      relations: ["organization"],
    });

    if (!invitation) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Invitation not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Invitation has already been accepted",
        ERROR_CODES.INVALID_INPUT,
      );
    }

    if (new Date() > invitation.expiresAt) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Invitation has expired",
        ERROR_CODES.INVALID_INPUT,
      );
    }

    return invitation;
  }

  /**
   * Accept an invitation
   * Called after staff logs in with their Cognito credentials
   * Creates Users row and OrganizationMembership row
   */
  async acceptInvite(
    token: string,
    cognitoSub: string,
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<{ user: User; membership: OrganizationMembership }> {
    const invitation = await this.getByToken(token);

    // verify email matches invitation
    if (invitation.email !== email) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Email does not match invitation",
        ERROR_CODES.FORBIDDEN,
      );
    }

    // create or find user row
    let user = await this.userRepo.findOne({
      where: { cognitoSub },
    });

    if (!user) {
      user = this.userRepo.create({
        cognitoSub,
        email,
        firstName,
        lastName,
      });
      await this.userRepo.save(user);
    }

    // create organization membership
    const membership = this.membershipRepo.create({
      userType: UserType.STAFF,
      user,
      organization: { id: invitation.organizationId },
    });
    await this.membershipRepo.save(membership);

    // mark invitation as accepted
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.invitationRepo.save(invitation);

    return { user, membership };
  }
}

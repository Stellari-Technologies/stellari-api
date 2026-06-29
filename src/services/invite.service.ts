import { AppDataSource } from "../config/database";
import { Invitation, InvitationStatus } from "../entities/Invitation";
import { User } from "../entities/User";
import {
  OrganizationMembership,
  UserType,
} from "../entities/OrganizationMembership";
import { Organization } from "../entities/Organization";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";
import { randomBytes } from "crypto";

export class InviteService {
  private invitationRepo = AppDataSource.getRepository(Invitation);
  private userRepo = AppDataSource.getRepository(User);
  private membershipRepo = AppDataSource.getRepository(OrganizationMembership);
  private organizationRepo = AppDataSource.getRepository(Organization);

  /**
   * Send an invite to a staff member
   * Generates a secure token and logs the invite link
   * TODO: replace console.log with SES email when we set up SES
   */
  async sendInvite(
    organizationId: string,
    email: string,
    createdBy: User,
  ): Promise<Invitation> {
    // check if already invited
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

    // get org name for the email
    const organization = await this.organizationRepo.findOne({
      where: { id: organizationId },
    });

    // generate unique secure token
    const token = randomBytes(32).toString("hex");

    // expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // save invitation row
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

    // TODO: replace this with SES email when we set up SES
    // The email should contain:
    //   - org name
    //   - invite link
    //   - instructions to create account with the same email
    console.log(`
    ====================================
    INVITE EMAIL FOR: ${email}
    ORG: ${organization?.organizationName}

    Subject: You've been invited to join ${organization?.organizationName} on Stellari!

    Body:
    Hi there!

    You've been invited to join ${organization?.organizationName} on Stellari.

    Click the link below to create your account:
    http://localhost:3000/invite/${token}

    Use this email address to sign up: ${email}
    This link expires in 7 days.

    - The Stellari Team
    ====================================
    `);

    return invitation;
  }

  /**
   * Get invitation by token
   * Called when staff clicks the invite link
   * Returns org details so frontend can show
   * "You've been invited to join X org"
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
   * Called after staff signs up via Cognito on the frontend
   * Staff uses their own email and chosen password (no temp password)
   * Frontend handles Cognito signUp() → confirmSignUp() → signIn()
   * Then calls this endpoint with their JWT token
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

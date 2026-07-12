import { AppDataSource } from "../config/database";
import { Invitation, InvitationStatus } from "../entities/Invitation";
import { User } from "../entities/User";
import {
  OrganizationMembership,
  UserType,
  UserRole,
} from "../entities/OrganizationMembership";
import { Organization } from "../entities/Organization";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";
import { randomBytes } from "crypto";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// ─── SES Client ──────────────────────────────────────────────────────────────
const sesClient = new SESClient({
  region: process.env.SES_REGION || "us-west-2",
});

export class InviteService {
  private invitationRepo = AppDataSource.getRepository(Invitation);
  private userRepo = AppDataSource.getRepository(User);
  private membershipRepo = AppDataSource.getRepository(OrganizationMembership);
  private organizationRepo = AppDataSource.getRepository(Organization);

  /**
   * Send an invite to a staff member
   * Generates a secure token and sends invite email via SES
   */
  async sendInvite(
    organizationId: string,
    email: string,
    createdBy: User,
    role?: UserRole,
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

    // send invite email via SES
    try {
      await this.sendInviteEmail(
        email,
        organization?.organizationName || "Stellari",
        token,
      );
    } catch (error) {
      // delete the invitation row so owner can retry
      await this.invitationRepo.remove(invitation);
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to send invitation email. Please try again.",
        ERROR_CODES.INTERNAL_ERROR,
      );
    }

    return invitation;
  }

  /**
   * Send invite email via AWS SES
   */
  private async sendInviteEmail(
    toEmail: string,
    orgName: string,
    token: string,
  ): Promise<void> {
    const inviteUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/invite/${token}`;
    // fail fast if SES_FROM_EMAIL is not configured
    // never fall back to a hardcoded email address
    const fromEmail = process.env.SES_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error("SES_FROM_EMAIL is not configured");
    }

    await sesClient.send(
      new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: `You've been invited to join ${orgName} on Stellari!`,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: `
Hi there!

You've been invited to join ${orgName} on Stellari.

Click the link below to create your account and get started:
${inviteUrl}

Use this exact email address to sign up: ${toEmail}

This link expires in 7 days.

- The Stellari Team
          `,
              Charset: "UTF-8",
            },
            Html: {
              Data: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #185FA5;">You've been invited to join ${orgName}!</h2>
  <p>Hi there!</p>
  <p>You've been invited to join <strong>${orgName}</strong> on Stellari.</p>
  <p>Click the button below to create your account and get started:</p>
  <a href="${inviteUrl}"
     style="background-color: #185FA5; color: white; padding: 12px 24px;
            text-decoration: none; border-radius: 4px; display: inline-block;
            margin: 16px 0;">
    Accept Invitation
  </a>
  <p style="color: #666; font-size: 14px;">
    Use this exact email address to sign up: <strong>${toEmail}</strong>
  </p>
  <p style="color: #666; font-size: 14px;">This link expires in 7 days.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #999; font-size: 12px;">- The Stellari Team</p>
</body>
</html>
          `,
              Charset: "UTF-8",
            },
          },
        },
      }),
    );

    console.log(`✅ Invite email sent to ${toEmail}`);
  }

  /**
   * Get invitation by token
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
   */
  async acceptInvite(
    token: string,
    cognitoSub: string,
    email: string,
    firstName: string,
    lastName: string,
    role?: UserRole,
  ): Promise<{ user: User; membership: OrganizationMembership }> {
    const invitation = await this.getByToken(token);

    if (invitation.email !== email) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Email does not match invitation",
        ERROR_CODES.FORBIDDEN,
      );
    }

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

    const membership = this.membershipRepo.create({
      userType: UserType.STAFF,
      // TODO: implement role assignment from invitation instead of accept request
      // currently staff can self-select any role at acceptance time
      // role should be set by the owner when sending the invite
      // and stored on the invitation row, then applied here

      userRole: role || undefined,
      user,
      organization: { id: invitation.organizationId },
    });
    await this.membershipRepo.save(membership);

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.invitationRepo.save(invitation);

    return { user, membership };
  }
}

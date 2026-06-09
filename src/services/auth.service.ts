/**
 * AuthService
 * Handles organization setup after owner signs up via Cognito
 */
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Organization } from "../entities/Organization";
import {
  OrganizationMembership,
  UserType,
} from "../entities/OrganizationMembership";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

interface SetupOrganizationInput {
  organizationName: string;
  organizationType: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private organizationRepository = AppDataSource.getRepository(Organization);
  private membershipRepository = AppDataSource.getRepository(
    OrganizationMembership,
  );

  /**
   * setupOrganization
   * Called after owner signs up via Cognito and verifies email.
   * Creates the organization and links the owner to it.
   *
   * @param cognitoSub - the owner's Cognito sub from the verified JWT token
   * @param email - the owner's email from the verified JWT token
   * @param data - organization name and type from request body
   */
  async setupOrganization(
    cognitoSub: string,
    email: string,
    data: SetupOrganizationInput,
  ) {
    // Step 1 — check if this user already has an org
    // they shouldn't be able to call setup twice
    const existingUser = await this.userRepository.findOne({
      where: { cognitoSub },
    });

    if (existingUser) {
      // check if they already have a membership
      const existingMembership = await this.membershipRepository.findOne({
        where: { user: { id: existingUser.id } },
      });

      if (existingMembership) {
        throw new AppError(
          HTTP_STATUS.CONFLICT,
          "Organization already set up for this account",
          ERROR_CODES.CONFLICT,
        );
      }
    }

    // Step 2 — create or find the user row
    // user might not exist yet if this is their very first API call
    let user = existingUser;

    if (!user) {
      user = this.userRepository.create({
        cognitoSub,
        email,
        firstName: "", // will be updated later in profile settings
        lastName: "",
      });
      await this.userRepository.save(user);
    }

    // Step 3 — create the organization
    const organization = this.organizationRepository.create({
      organizationName: data.organizationName,
      organizationType: data.organizationType,
    });
    await this.organizationRepository.save(organization);

    // Step 4 — create the membership linking owner to org
    const membership = this.membershipRepository.create({
      userType: UserType.ACCOUNT_OWNER,
      user,
      organization,
    });
    await this.membershipRepository.save(membership);

    return { user, organization, membership };
  }
}

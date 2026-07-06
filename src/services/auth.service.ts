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
  currencyName?: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private organizationRepository = AppDataSource.getRepository(Organization);
  private membershipRepository = AppDataSource.getRepository(
    OrganizationMembership,
  );

  async setupOrganization(
    cognitoSub: string,
    email: string,
    data: SetupOrganizationInput,
  ) {
    const existingUser = await this.userRepository.findOne({
      where: { cognitoSub },
    });

    if (existingUser) {
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

    let user = existingUser;
    if (!user) {
      user = this.userRepository.create({
        cognitoSub,
        email,
        firstName: "",
        lastName: "",
      });
      await this.userRepository.save(user);
    }

    const organization = this.organizationRepository.create({
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      currencyName: data.currencyName || "Stars",
    });
    await this.organizationRepository.save(organization);

    const membership = this.membershipRepository.create({
      userType: UserType.ACCOUNT_OWNER,
      user,
      organization,
    });
    await this.membershipRepository.save(membership);

    return { user, organization, membership };
  }
}

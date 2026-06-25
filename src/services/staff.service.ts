import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import {
  OrganizationMembership,
  UserType,
} from "../entities/OrganizationMembership";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

interface CreateStaffInput {
  firstName: string;
  lastName: string;
  email: string;
}

export class StaffService {
  private userRepo = AppDataSource.getRepository(User);
  private membershipRepo = AppDataSource.getRepository(OrganizationMembership);

  /**
   * CREATE - Add a new staff member to the org
   * Creates a Users row and OrganizationMembership row
   * cognitoSub is NULL for now — Cognito integration added later
   */
  async create(
    organizationId: string,
    data: CreateStaffInput,
  ): Promise<{ user: User; membership: OrganizationMembership }> {
    // check if email already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      // check if they're already in this org
      const existingMembership = await this.membershipRepo.findOne({
        where: {
          user: { id: existingUser.id },
          organization: { id: organizationId },
        },
      });

      if (existingMembership) {
        throw new AppError(
          HTTP_STATUS.CONFLICT,
          "A staff member with this email already exists in this organization",
          ERROR_CODES.CONFLICT,
        );
      }

      // user exists but not in this org — add them as staff
      const membership = this.membershipRepo.create({
        userType: UserType.STAFF,
        user: existingUser,
        organization: { id: organizationId },
      });
      await this.membershipRepo.save(membership);

      return { user: existingUser, membership };
    }

    // create new user row
    // cognitoSub is null until Cognito integration is added
    const user = this.userRepo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      cognitoSub: undefined,
    });
    await this.userRepo.save(user);

    // create membership linking staff to org
    const membership = this.membershipRepo.create({
      userType: UserType.STAFF,
      user,
      organization: { id: organizationId },
    });
    await this.membershipRepo.save(membership);

    return { user, membership };
  }

  /**
   * FIND ALL - Get all staff members in the org
   */
  async findAll(organizationId: string): Promise<OrganizationMembership[]> {
    return await this.membershipRepo.find({
      where: {
        organization: { id: organizationId },
        userType: UserType.STAFF,
      },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * FIND BY ID - Get one staff member
   * Throws 404 if not found or not in this org
   */
  async findById(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembership> {
    const membership = await this.membershipRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: organizationId },
        userType: UserType.STAFF,
      },
      relations: ["user"],
    });

    if (!membership) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Staff member not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    return membership;
  }

  /**
   * DELETE - Remove a staff member from the org
   * Removes OrganizationMembership row only
   * User row stays in case they belong to other orgs
   */
  async delete(organizationId: string, userId: string): Promise<void> {
    const membership = await this.findById(organizationId, userId);
    await this.membershipRepo.remove(membership);
  }
}

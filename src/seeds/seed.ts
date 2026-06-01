import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Organization } from "../entities/Organization";
import {
  OrganizationMembership,
  UserType,
} from "../entities/OrganizationMembership";

const seed = async () => {
  // Initialize database connection
  await AppDataSource.initialize();
  console.log("Database connected");

  const userRepository = AppDataSource.getRepository(User);
  const organizationRepository = AppDataSource.getRepository(Organization);
  const membershipRepository = AppDataSource.getRepository(
    OrganizationMembership,
  );

  // Check if seed data already exists
  const existingUser = await userRepository.findOne({
    where: { email: "owner@test.com" },
  });

  if (existingUser) {
    console.log("Seed data already exists, skipping...");
    await AppDataSource.destroy();
    return;
  }

  // Create test organization
  const organization = organizationRepository.create({
    organizationName: "Test Organization",
    organizationType: "test",
  });
  await organizationRepository.save(organization);
  console.log("Test organization created:", organization.id);

  // Create test account owner
  const user = userRepository.create({
    cognitoSub: "test-cognito-sub-123",
    firstName: "Test",
    lastName: "Owner",
    email: "owner@test.com",
  });
  await userRepository.save(user);
  console.log("Test user created:", user.id);

  // Create organization membership
  const membership = membershipRepository.create({
    userType: UserType.ACCOUNT_OWNER,
    user: user,
    organization: organization,
  });
  await membershipRepository.save(membership);
  console.log("Organization membership created:", membership.id);

  console.log("Seed complete!");
  await AppDataSource.destroy();
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

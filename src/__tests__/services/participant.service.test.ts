/**
 * ============================================================================
 * PARTICIPANT SERVICE TESTS
 * ============================================================================
 *
 * Tests for ParticipantService business logic.
 * All database calls are mocked — no real DB needed.
 *
 * Pattern: Arrange → Act → Assert
 * ============================================================================
 */

import { ParticipantService } from "../../services/participant.service";
import { AppDataSource } from "../../config/database";

// ─── Mock the database ────────────────────────────────────────────────────────
// Replaces real TypeORM with fake functions we control
jest.mock("../../config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// ─── Mock repository methods ──────────────────────────────────────────────────
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

// ─── Test data ────────────────────────────────────────────────────────────────
const mockOrgId = "org-uuid-123";
const mockParticipantId = "participant-uuid-123";

const mockParticipant = {
  id: mockParticipantId,
  firstName: "Ahmed",
  lastName: "Smith",
  pointsBalance: 0,
  cognitoSub: null,
  parentFirstName: "John",
  parentLastName: "Smith",
  dateOfBirth: null,
  organization: { id: mockOrgId },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  // before each test reset all mocks to clean state
  jest.clearAllMocks();
  // make getRepository return our mock repository
  (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("ParticipantService", () => {
  // ── create() ────────────────────────────────────────────────────────────────
  describe("create()", () => {
    it("should create a participant with valid data", async () => {
      // ARRANGE
      mockRepository.create.mockReturnValue(mockParticipant);
      mockRepository.save.mockResolvedValue(mockParticipant);

      const service = new ParticipantService();

      // ACT
      const result = await service.create(mockOrgId, {
        firstName: "Ahmed",
        lastName: "Smith",
        parentFirstName: "John",
        parentLastName: "Smith",
      });

      // ASSERT
      expect(result).toBeDefined();
      expect(result.firstName).toBe("Ahmed");
      expect(result.lastName).toBe("Smith");
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Ahmed",
          lastName: "Smith",
          pointsBalance: 0,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should set pointsBalance to 0 by default", async () => {
      // ARRANGE
      mockRepository.create.mockReturnValue(mockParticipant);
      mockRepository.save.mockResolvedValue(mockParticipant);

      const service = new ParticipantService();

      // ACT
      const result = await service.create(mockOrgId, {
        firstName: "Ahmed",
        lastName: "Smith",
      });

      // ASSERT
      expect(result.pointsBalance).toBe(0);
    });
  });

  // ── findAll() ───────────────────────────────────────────────────────────────
  describe("findAll()", () => {
    it("should return all participants for an org", async () => {
      // ARRANGE
      const mockParticipants = [
        mockParticipant,
        { ...mockParticipant, id: "another-id", firstName: "Sara" },
      ];
      mockRepository.find.mockResolvedValue(mockParticipants);

      const service = new ParticipantService();

      // ACT
      const result = await service.findAll(mockOrgId);

      // ASSERT
      expect(result).toHaveLength(2);
      expect(result[0].firstName).toBe("Ahmed");
      expect(result[1].firstName).toBe("Sara");
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organization: { id: mockOrgId } },
        }),
      );
    });

    it("should return empty array when no participants exist", async () => {
      // ARRANGE
      mockRepository.find.mockResolvedValue([]);

      const service = new ParticipantService();

      // ACT
      const result = await service.findAll(mockOrgId);

      // ASSERT
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  // ── findById() ──────────────────────────────────────────────────────────────
  describe("findById()", () => {
    it("should return a participant when found", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(mockParticipant);

      const service = new ParticipantService();

      // ACT
      const result = await service.findById(mockOrgId, mockParticipantId);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.id).toBe(mockParticipantId);
      expect(result.firstName).toBe("Ahmed");
    });

    it("should throw 404 when participant not found", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ParticipantService();

      // ACT & ASSERT
      await expect(
        service.findById(mockOrgId, "non-existent-id"),
      ).rejects.toThrow("Participant not found");
    });

    it("should only find participants within the correct org", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ParticipantService();

      // ACT & ASSERT
      await expect(
        service.findById("wrong-org-id", mockParticipantId),
      ).rejects.toThrow("Participant not found");

      expect(mockRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: mockParticipantId,
            organization: { id: "wrong-org-id" },
          },
        }),
      );
    });
  });

  // ── update() ────────────────────────────────────────────────────────────────
  describe("update()", () => {
    it("should update participant details", async () => {
      // ARRANGE
      const updatedParticipant = { ...mockParticipant, firstName: "Updated" };
      mockRepository.findOne.mockResolvedValue(mockParticipant);
      mockRepository.save.mockResolvedValue(updatedParticipant);

      const service = new ParticipantService();

      // ACT
      const result = await service.update(mockOrgId, mockParticipantId, {
        firstName: "Updated",
      });

      // ASSERT
      expect(result.firstName).toBe("Updated");
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw 404 when updating non-existent participant", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ParticipantService();

      // ACT & ASSERT
      await expect(
        service.update(mockOrgId, "non-existent-id", { firstName: "Updated" }),
      ).rejects.toThrow("Participant not found");
    });
  });

  // ── delete() ────────────────────────────────────────────────────────────────
  describe("delete()", () => {
    it("should delete an existing participant", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(mockParticipant);
      mockRepository.remove.mockResolvedValue(mockParticipant);

      const service = new ParticipantService();

      // ACT
      await service.delete(mockOrgId, mockParticipantId);

      // ASSERT
      expect(mockRepository.remove).toHaveBeenCalledWith(mockParticipant);
    });

    it("should throw 404 when deleting non-existent participant", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ParticipantService();

      // ACT & ASSERT
      await expect(
        service.delete(mockOrgId, "non-existent-id"),
      ).rejects.toThrow("Participant not found");

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});

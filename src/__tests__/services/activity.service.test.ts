/**
 * ============================================================================
 * ACTIVITY SERVICE TESTS
 * ============================================================================
 */

import { ActivityService } from "../../services/activity.service";
import { AppDataSource } from "../../config/database";

jest.mock("../../config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockOrgId = "org-uuid-123";
const mockActivityId = "activity-uuid-123";

const mockActivity = {
  id: mockActivityId,
  title: "Top 3 in Blooket",
  description: "Awarded to top 3 players",
  currencyValue: 2,
  isRepeatable: true,
  isActive: true,
  organization: { id: mockOrgId },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
});

describe("ActivityService", () => {
  // ── create() ────────────────────────────────────────────────────────────────
  describe("create()", () => {
    it("should create an activity with valid data", async () => {
      // ARRANGE
      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      const service = new ActivityService();

      // ACT
      const result = await service.create(mockOrgId, {
        title: "Top 3 in Blooket",
        currencyValue: 2,
        isRepeatable: true,
      });

      // ASSERT
      expect(result).toBeDefined();
      expect(result.title).toBe("Top 3 in Blooket");
      expect(result.currencyValue).toBe(2);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should set isRepeatable to true by default", async () => {
      // ARRANGE
      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      const service = new ActivityService();

      // ACT
      const result = await service.create(mockOrgId, {
        title: "Top 3 in Blooket",
        currencyValue: 2,
      });

      // ASSERT
      expect(result.isRepeatable).toBe(true);
    });

    it("should allow creating a one-time activity", async () => {
      // ARRANGE
      const oneTimeActivity = { ...mockActivity, isRepeatable: false };
      mockRepository.create.mockReturnValue(oneTimeActivity);
      mockRepository.save.mockResolvedValue(oneTimeActivity);

      const service = new ActivityService();

      // ACT
      const result = await service.create(mockOrgId, {
        title: "White Belt Build",
        currencyValue: 5,
        isRepeatable: false,
      });

      // ASSERT
      expect(result.isRepeatable).toBe(false);
    });
  });

  // ── findAll() ───────────────────────────────────────────────────────────────
  describe("findAll()", () => {
    it("should return all active activities for an org", async () => {
      // ARRANGE
      const mockActivities = [
        mockActivity,
        { ...mockActivity, id: "another-id", title: "White Belt Build" },
      ];
      mockRepository.find.mockResolvedValue(mockActivities);

      const service = new ActivityService();

      // ACT
      const result = await service.findAll(mockOrgId);

      // ASSERT
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Top 3 in Blooket");
      expect(result[1].title).toBe("White Belt Build");
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organization: { id: mockOrgId },
            isActive: true,
          },
        }),
      );
    });

    it("should return empty array when no activities exist", async () => {
      // ARRANGE
      mockRepository.find.mockResolvedValue([]);

      const service = new ActivityService();

      // ACT
      const result = await service.findAll(mockOrgId);

      // ASSERT
      expect(result).toHaveLength(0);
    });
  });

  // ── findById() ──────────────────────────────────────────────────────────────
  describe("findById()", () => {
    it("should return an activity when found", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(mockActivity);

      const service = new ActivityService();

      // ACT
      const result = await service.findById(mockOrgId, mockActivityId);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.id).toBe(mockActivityId);
      expect(result.title).toBe("Top 3 in Blooket");
    });

    it("should throw 404 when activity not found", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ActivityService();

      // ACT & ASSERT
      await expect(
        service.findById(mockOrgId, "non-existent-id"),
      ).rejects.toThrow("Activity not found");
    });
  });

  // ── update() ────────────────────────────────────────────────────────────────
  describe("update()", () => {
    it("should update activity details", async () => {
      // ARRANGE
      const updatedActivity = {
        ...mockActivity,
        title: "Updated Title",
        currencyValue: 5,
      };
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(updatedActivity);

      const service = new ActivityService();

      // ACT
      const result = await service.update(mockOrgId, mockActivityId, {
        title: "Updated Title",
        currencyValue: 5,
      });

      // ASSERT
      expect(result.title).toBe("Updated Title");
      expect(result.currencyValue).toBe(5);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw 404 when updating non-existent activity", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ActivityService();

      // ACT & ASSERT
      await expect(
        service.update(mockOrgId, "non-existent-id", { title: "Updated" }),
      ).rejects.toThrow("Activity not found");
    });

    it("should soft delete by setting isActive to false", async () => {
      // ARRANGE
      const deactivatedActivity = { ...mockActivity, isActive: false };
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(deactivatedActivity);

      const service = new ActivityService();

      // ACT
      const result = await service.update(mockOrgId, mockActivityId, {
        isActive: false,
      });

      // ASSERT
      expect(result.isActive).toBe(false);
    });
  });

  // ── delete() ────────────────────────────────────────────────────────────────
  describe("delete()", () => {
    it("should soft delete an activity by setting isActive to false", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue({
        ...mockActivity,
        isActive: false,
      });

      const service = new ActivityService();

      // ACT
      await service.delete(mockOrgId, mockActivityId);

      // ASSERT
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it("should throw 404 when deleting non-existent activity", async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      const service = new ActivityService();

      // ACT & ASSERT
      await expect(
        service.delete(mockOrgId, "non-existent-id"),
      ).rejects.toThrow("Activity not found");

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});

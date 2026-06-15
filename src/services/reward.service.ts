import { AppDataSource } from "../config/database";
import { Reward } from "../entities/Reward";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

interface CreateRewardInput {
  title: string;
  description?: string;
  currencyCost: number;
}

interface UpdateRewardInput {
  title?: string;
  description?: string;
  currencyCost?: number;
  isActive?: boolean;
}

export class RewardService {
  private repo = AppDataSource.getRepository(Reward);

  async create(
    organizationId: string,
    data: CreateRewardInput,
  ): Promise<Reward> {
    const reward = this.repo.create({
      title: data.title,
      description: data.description,
      currencyCost: data.currencyCost,
      isActive: true,
      organization: { id: organizationId },
    });
    return await this.repo.save(reward);
  }

  async findAll(organizationId: string): Promise<Reward[]> {
    return await this.repo.find({
      where: {
        organization: { id: organizationId },
        isActive: true,
      },
      order: { createdAt: "DESC" },
    });
  }

  async findById(organizationId: string, rewardId: string): Promise<Reward> {
    const reward = await this.repo.findOne({
      where: {
        id: rewardId,
        organization: { id: organizationId },
      },
    });
    if (!reward) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Reward not found",
        ERROR_CODES.NOT_FOUND,
      );
    }
    return reward;
  }

  async update(
    organizationId: string,
    rewardId: string,
    data: UpdateRewardInput,
  ): Promise<Reward> {
    const reward = await this.findById(organizationId, rewardId);
    if (data.title !== undefined) reward.title = data.title;
    if (data.description !== undefined) reward.description = data.description;
    if (data.currencyCost !== undefined)
      reward.currencyCost = data.currencyCost;
    if (data.isActive !== undefined) reward.isActive = data.isActive;
    return await this.repo.save(reward);
  }

  async delete(organizationId: string, rewardId: string): Promise<void> {
    const reward = await this.findById(organizationId, rewardId);
    reward.isActive = false;
    await this.repo.save(reward);
  }
}

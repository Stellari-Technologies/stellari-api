import { AppDataSource } from "../config/database";
import { Activity } from "../entities/Activity";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

interface CreateActivityInput {
  title: string;
  description?: string;
  currencyValue: number;
  isRepeatable?: boolean;
}

interface UpdateActivityInput {
  title?: string;
  description?: string;
  currencyValue?: number;
  isRepeatable?: boolean;
  isActive?: boolean;
}

export class ActivityService {
  private repo = AppDataSource.getRepository(Activity);

  async create(
    organizationId: string,
    data: CreateActivityInput,
  ): Promise<Activity> {
    const activity = this.repo.create({
      title: data.title,
      description: data.description,
      currencyValue: data.currencyValue,
      isRepeatable: data.isRepeatable ?? true,
      isActive: true,
      organization: { id: organizationId },
    });
    return await this.repo.save(activity);
  }

  async findAll(organizationId: string): Promise<Activity[]> {
    return await this.repo.find({
      where: {
        organization: { id: organizationId },
        isActive: true,
      },
      order: { createdAt: "DESC" },
    });
  }

  async findById(
    organizationId: string,
    activityId: string,
  ): Promise<Activity> {
    const activity = await this.repo.findOne({
      where: {
        id: activityId,
        organization: { id: organizationId },
      },
    });
    if (!activity) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Activity not found",
        ERROR_CODES.NOT_FOUND,
      );
    }
    return activity;
  }

  async update(
    organizationId: string,
    activityId: string,
    data: UpdateActivityInput,
  ): Promise<Activity> {
    const activity = await this.findById(organizationId, activityId);
    if (data.title !== undefined) activity.title = data.title;
    if (data.description !== undefined) activity.description = data.description;
    if (data.currencyValue !== undefined)
      activity.currencyValue = data.currencyValue;
    if (data.isRepeatable !== undefined)
      activity.isRepeatable = data.isRepeatable;
    if (data.isActive !== undefined) activity.isActive = data.isActive;
    return await this.repo.save(activity);
  }

  async delete(organizationId: string, activityId: string): Promise<void> {
    const activity = await this.findById(organizationId, activityId);
    activity.isActive = false;
    await this.repo.save(activity);
  }
}

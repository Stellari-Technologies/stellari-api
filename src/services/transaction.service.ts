import { AppDataSource } from "../config/database";
import { Transaction, TransactionType } from "../entities/Transaction";
import { ParticipantProfile } from "../entities/ParticipantProfile";
import { Activity } from "../entities/Activity";
import { Reward } from "../entities/Reward";
import { User } from "../entities/User";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

export class TransactionService {
  private transactionRepo = AppDataSource.getRepository(Transaction);
  private participantRepo = AppDataSource.getRepository(ParticipantProfile);
  private activityRepo = AppDataSource.getRepository(Activity);
  private rewardRepo = AppDataSource.getRepository(Reward);

  /**
   * Calculate participant's current balance
   * by summing all their transactions
   */
  async getBalance(participantId: string): Promise<number> {
    const result = await this.transactionRepo
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "balance")
      .where("transaction.participant_profile_id = :participantId", {
        participantId,
      })
      .getRawOne();

    return parseInt(result?.balance || "0", 10);
  }

  /**
   * Complete an activity for a participant
   * Earns currency
   */
  async completeActivity(
    organizationId: string,
    participantId: string,
    activityId: string,
    createdBy: User,
  ): Promise<{ transaction: Transaction; newBalance: number }> {
    // Step 1 — find the participant and verify they belong to this org
    const participant = await this.participantRepo.findOne({
      where: {
        id: participantId,
        organization: { id: organizationId },
      },
    });

    if (!participant) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Participant not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    // Step 2 — find the activity and verify it belongs to this org
    const activity = await this.activityRepo.findOne({
      where: {
        id: activityId,
        organization: { id: organizationId },
        isActive: true,
      },
    });

    if (!activity) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Activity not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    // Step 3 — if not repeatable check if already completed
    if (!activity.isRepeatable) {
      const alreadyCompleted = await this.transactionRepo.findOne({
        where: {
          participantProfile: { id: participantId },
          activity: { id: activityId },
          type: TransactionType.EARNED,
        },
      });

      if (alreadyCompleted) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          `${activity.title} has already been completed by this participant`,
          ERROR_CODES.CONFLICT,
        );
      }
    }

    // Step 4 — create the transaction
    const transaction = this.transactionRepo.create({
      type: TransactionType.EARNED,
      amount: activity.currencyValue,
      participantProfile: participant,
      activity: activity,
      createdBy: createdBy,
    });

    await this.transactionRepo.save(transaction);

    // Step 5 — calculate new balance
    const newBalance = await this.getBalance(participantId);

    return { transaction, newBalance };
  }

  /**
   * Redeem a reward for a participant
   * Spends currency
   */
  async redeemReward(
    organizationId: string,
    participantId: string,
    rewardId: string,
    createdBy: User,
  ): Promise<{ transaction: Transaction; newBalance: number }> {
    // Step 1 — find the participant
    const participant = await this.participantRepo.findOne({
      where: {
        id: participantId,
        organization: { id: organizationId },
      },
    });

    if (!participant) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Participant not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    // Step 2 — find the reward
    const reward = await this.rewardRepo.findOne({
      where: {
        id: rewardId,
        organization: { id: organizationId },
        isActive: true,
      },
    });

    if (!reward) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Reward not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    // Step 3 — check if participant has enough currency
    const currentBalance = await this.getBalance(participantId);

    if (currentBalance < reward.currencyCost) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Not enough currency. Current balance: ${currentBalance}, Required: ${reward.currencyCost}`,
        ERROR_CODES.INVALID_INPUT,
      );
    }

    // Step 4 — create the transaction
    // amount is NEGATIVE because currency is being spent
    const transaction = this.transactionRepo.create({
      type: TransactionType.REDEEMED,
      amount: -reward.currencyCost,
      participantProfile: participant,
      reward: reward,
      createdBy: createdBy,
    });

    await this.transactionRepo.save(transaction);

    // Step 5 — calculate new balance
    const newBalance = await this.getBalance(participantId);

    return { transaction, newBalance };
  }

  /**
   * Get full transaction history for a participant
   */
  async getHistory(
    organizationId: string,
    participantId: string,
  ): Promise<{ transactions: Transaction[]; currentBalance: number }> {
    // verify participant belongs to this org
    const participant = await this.participantRepo.findOne({
      where: {
        id: participantId,
        organization: { id: organizationId },
      },
    });

    if (!participant) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Participant not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    const transactions = await this.transactionRepo.find({
      where: {
        participantProfile: { id: participantId },
      },
      relations: ["activity", "reward", "createdBy"],
      order: { createdAt: "DESC" },
    });

    const currentBalance = await this.getBalance(participantId);

    return { transactions, currentBalance };
  }
}

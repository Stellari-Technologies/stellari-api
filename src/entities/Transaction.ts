import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Generated,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Reward } from "./Reward";
import { User } from "./User";
import { ParticipantProfile } from "./ParticipantProfile";

export enum TransactionType {
  EARNED = "earned",
  REDEEMED = "redeemed",
}

@Entity("transactions")
export class Transaction {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  // Copied from the reward at time of transaction
  // earned = stars added, redeemed = stars subtracted
  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type!: TransactionType;

  // Copied from the reward at time of transaction
  // always stored as positive number
  // type determines if it adds or subtracts
  @Column("integer")
  points!: number;

  // Many transactions belong to one participant profile
  @ManyToOne(
    () => ParticipantProfile,
    (participantProfile: ParticipantProfile) => participantProfile.transactions,
  )
  @JoinColumn({ name: "participant_profile_id" })
  participantProfile!: ParticipantProfile;

  // Many transactions reference one reward
  @ManyToOne(() => Reward, (reward: Reward) => reward.transactions)
  @JoinColumn({ name: "reward_id" })
  reward!: Reward;

  // Many transactions created by one user (staff member)
  @ManyToOne(() => User, (user: User) => user.transactions)
  @JoinColumn({ name: "created_by" })
  createdBy!: User;

  // No updatedAt — transactions should never be edited
  @CreateDateColumn()
  createdAt!: Date;
}

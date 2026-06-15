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
import { Activity } from "./Activity";

export enum TransactionType {
  EARNED = "earned",
  REDEEMED = "redeemed",
  ADJUSTED = "adjusted",
}

@Entity("transactions")
export class Transaction {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type!: TransactionType;

  // positive for earned, negative for redeemed
  @Column("integer")
  amount!: number;

  // Many transactions belong to one participant
  @ManyToOne(
    () => ParticipantProfile,
    (participantProfile: ParticipantProfile) => participantProfile.transactions,
  )
  @JoinColumn({ name: "participant_profile_id" })
  participantProfile!: ParticipantProfile;

  // Set when type = earned — which activity triggered this
  @ManyToOne(() => Activity, (activity: Activity) => activity.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: "activity_id" })
  activity?: Activity;

  // Set when type = redeemed — which reward was redeemed
  @ManyToOne(() => Reward, (reward: Reward) => reward.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: "reward_id" })
  reward?: Reward;

  // Which staff member created this transaction
  @ManyToOne(() => User, (user: User) => user.transactions)
  @JoinColumn({ name: "created_by" })
  createdBy!: User;

  // No updatedAt — transactions should never be edited
  @CreateDateColumn()
  createdAt!: Date;
}

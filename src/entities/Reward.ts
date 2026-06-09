import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Organization } from "./Organization";
import { Transaction } from "./Transaction";

export enum RewardType {
  EARNED = "earned",
  REDEEMED = "redeemed",
}

@Entity("rewards")
export class Reward {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column("varchar")
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  // How many stars this reward gives or costs
  @Column("integer")
  points!: number;

  // earned = gives stars, redeemed = costs stars
  @Column({
    type: "enum",
    enum: RewardType,
  })
  type!: RewardType;

  // true = can be clicked many times, false = one time only per participant
  @Column("boolean", { default: true })
  isRepeatable!: boolean;

  // owner can hide rewards from staff
  @Column("boolean", { default: true })
  isActive!: boolean;

  // Many rewards belong to one organization
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.rewards,
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  // One reward can appear in many transactions
  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.reward,
  )
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

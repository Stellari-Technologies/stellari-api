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

@Entity("rewards")
export class Reward {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column("varchar")
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  // How much currency this reward costs to redeem
  @Column("integer")
  currencyCost!: number;

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

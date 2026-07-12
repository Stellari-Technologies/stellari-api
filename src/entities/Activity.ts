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

@Entity("activities")
export class Activity {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  // Which org this activity belongs to
  @Column("varchar")
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  // How much currency this activity generates when completed
  @Column("integer")
  currencyValue!: number;

  // true = can be completed many times (e.g. Top 3 in Blooket)
  // false = one time only (e.g. White Belt Build)
  @Column("boolean", { default: true })
  isRepeatable!: boolean;

  // owner can hide activities
  @Column("boolean", { default: true })
  isActive!: boolean;

  // Many activities belong to one organization
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.activities,
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  // One activity can appear in many transactions
  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.activity,
  )
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

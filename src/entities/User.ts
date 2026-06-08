import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  OneToMany,
} from "typeorm";
import { OrganizationMembership } from "./OrganizationMembership";
import { Transaction } from "./Transaction";

@Entity("users")
export class User {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column("varchar", { nullable: true, unique: true })
  cognitoSub?: string;

  @Column("varchar")
  firstName!: string;

  @Column("varchar")
  lastName!: string;

  @Column("varchar", { unique: true })
  email!: string;

  // One user can have many org memberships
  @OneToMany(
    () => OrganizationMembership,
    (membership: OrganizationMembership) => membership.user,
  )
  memberships!: OrganizationMembership[];

  // One staff member can create many transactions
  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.createdBy,
  )
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

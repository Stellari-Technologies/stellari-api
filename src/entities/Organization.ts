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
import { Reward } from "./Reward";

@Entity("organizations")
export class Organization {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column("varchar")
  organizationName!: string;

  @Column("varchar")
  organizationType!: string;

  // One organization has many memberships
  @OneToMany(
    () => OrganizationMembership,
    (membership: OrganizationMembership) => membership.organization,
  )
  memberships!: OrganizationMembership[];

  // One organization has many rewards
  @OneToMany(() => Reward, (reward: Reward) => reward.organization)
  rewards!: Reward[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

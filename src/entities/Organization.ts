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
import { ParticipantProfile } from "./ParticipantProfile";

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

  // One organization has many participant profiles
  @OneToMany(
    () => ParticipantProfile,
    (participantProfile: ParticipantProfile) => participantProfile.organization,
  )
  participantProfiles!: ParticipantProfile[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

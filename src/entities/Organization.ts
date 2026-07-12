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
import { Activity } from "./Activity";

@Entity("organizations")
export class Organization {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column("varchar")
  organizationName!: string;

  @Column("varchar")
  organizationType!: string;

  // The name of the currency used in this org
  // e.g. "Stars", "Points", "Tokens", "XP"
  // defaults to "Stars" if not set
  @Column("varchar", { default: "Stars" })
  currencyName!: string;

  @OneToMany(
    () => OrganizationMembership,
    (membership: OrganizationMembership) => membership.organization,
  )
  memberships!: OrganizationMembership[];

  @OneToMany(() => Reward, (reward: Reward) => reward.organization)
  rewards!: Reward[];

  @OneToMany(() => Activity, (activity: Activity) => activity.organization)
  activities!: Activity[];

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

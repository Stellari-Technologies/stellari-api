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

@Entity("participant_profiles")
export class ParticipantProfile {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  // Direct link to org — participants don't go through OrganizationMembership
  @Column("uuid")
  organizationId!: string;

  // NULLABLE — participants have no Cognito account for MVP
  // filled in later when participants get their own accounts
  @Column("varchar", { nullable: true, unique: true })
  cognitoSub?: string;

  @Column("varchar")
  firstName!: string;

  @Column("varchar")
  lastName!: string;

  // Starts at 0 — updated every time a transaction is created
  @Column("integer", { default: 0 })
  pointsBalance!: number;

  // Parent info stored here for future parent accounts
  // nullable because not every participant has parent info entered yet
  @Column("varchar", { nullable: true })
  parentFirstName?: string;

  @Column("varchar", { nullable: true })
  parentLastName?: string;

  // Used to determine if participant is under 18
  // nullable because it's optional for MVP
  @Column("date", { nullable: true })
  dateOfBirth?: Date;

  // Many participant profiles belong to one organization
  @ManyToOne(
    () => Organization,
    (organization: Organization) => organization.participantProfiles,
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  // One participant has many transactions
  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.participantProfile,
  )
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

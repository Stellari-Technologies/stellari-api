import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Generated,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
}

@Entity("invitations")
export class Invitation {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  // who is being invited
  @Column("varchar")
  email!: string;

  // unique token that goes in the invite link
  @Column("varchar", { unique: true })
  token!: string;

  // which org they are being invited to
  @Column("uuid")
  organizationId!: string;

  // status of the invitation
  @Column({
    type: "enum",
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  // when the token expires
  @Column("timestamp")
  expiresAt!: Date;

  // when they accepted
  @Column("timestamp", { nullable: true })
  acceptedAt?: Date;

  // which org this invite belongs to
  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  // who sent the invite
  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdBy!: User;

  @Column("uuid")
  createdById!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

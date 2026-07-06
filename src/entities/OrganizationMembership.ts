import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "./User";
import { Organization } from "./Organization";

export enum UserType {
  ACCOUNT_OWNER = "account_owner",
  STAFF = "staff",
}

export enum UserRole {
  TEACHER = "teacher",
  COORDINATOR = "coordinator",
  ASSISTANT = "assistant",
}

@Entity("organization_memberships")
export class OrganizationMembership {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: UserType,
  })
  userType!: UserType;

  @Column({
    type: "enum",
    enum: UserRole,
    nullable: true,
  })
  userRole?: UserRole;

  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Organization, (organization) => organization.memberships)
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

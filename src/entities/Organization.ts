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

@Entity("organizations")
export class Organization {
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  @Column("varchar")
  organizationName!: string;

  @Column("varchar")
  organizationType!: string;

  // One organization has many memberships (staff and account owners)
  @OneToMany(
    () => OrganizationMembership,
    (membership: OrganizationMembership) => membership.organization,
  )
  memberships!: OrganizationMembership[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

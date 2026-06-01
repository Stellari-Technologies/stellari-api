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

@Entity("users")
export class User {
  // Auto-Gen UUID
  @PrimaryColumn("uuid")
  @Generated("uuid")
  id!: string;

  //Cognito sub - linking the user to the cognito acc
  @Column("varchar", { unique: true })
  cognitoSub?: string;

  @Column("varchar")
  firstName!: string;

  @Column("varchar")
  lastName!: string;

  @Column("varchar", { unique: true })
  email!: string;

  // The relationship to OrganizationMembership (Organization_User in ERD diagram)
  // one user can have many memberships (for mvp it was just one needed but this also future proofs it without any crazy overhead)
  @OneToMany(
    () => OrganizationMembership,
    (membership: OrganizationMembership) => membership.user,
  )
  memberships!: OrganizationMembership[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

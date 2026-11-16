import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
  @Column({ name: "yandex_id", type: "text", unique: true }) yandexId!: string;
  @Column({ type: "text", nullable: true }) email!: string | null;
  @Column({ name: "first_name", type: "text", nullable: true }) firstName!:
    string | null;
  @Column({ name: "last_name", type: "text", nullable: true }) lastName!:
    string | null;
  @Column({ name: "avatar_url", type: "text", nullable: true }) avatarUrl!:
    string | null;
}

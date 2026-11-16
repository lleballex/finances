import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1730000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "email" text, "first_name" text, "last_name" text, "avatar_url" text, "yandex_id" text NOT NULL UNIQUE)`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "user"');
  }
}

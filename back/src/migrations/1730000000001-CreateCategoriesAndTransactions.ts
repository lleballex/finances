import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriesAndTransactions1730000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE category (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), user_id uuid NOT NULL REFERENCES "user"(id), name text NOT NULL, type text NOT NULL CHECK (type IN ('income', 'expense')), is_regular boolean NOT NULL DEFAULT false, parent_id uuid REFERENCES category(id), emoji text NOT NULL, color text NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX category_user_id_idx ON category(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX category_parent_id_idx ON category(parent_id)`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), category_id uuid NOT NULL REFERENCES category(id), amount numeric(12,2) NOT NULL CHECK (amount <> 0), operation_date date NOT NULL, accounting_period date NOT NULL, description text, is_regular boolean NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX transaction_category_id_idx ON "transaction"(category_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX transaction_operation_date_idx ON "transaction"(operation_date)`,
    );
    await queryRunner.query(
      `CREATE INDEX transaction_accounting_period_idx ON "transaction"(accounting_period)`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "transaction"');
    await queryRunner.query("DROP TABLE category");
  }
}

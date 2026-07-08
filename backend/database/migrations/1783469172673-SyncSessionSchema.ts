import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Brings the `sessions` table in line with the Session entity after the
 * DB-backed session-revocation work:
 *  - add `sit` (session-issued-at) — the stable session identifier,
 *  - make `secret_hash` nullable (JWT sessions store no secret),
 *  - add the unique (user_id, sit) index used to look a session up / revoke it.
 *
 * (A full `migration:generate` also churns constraint/enum names and
 * timestamptz→timestamp across every table — cosmetic drift from the
 * hand-written InitialSchema — which we intentionally skip here.)
 */
export class SyncSessionSchema1783469172673 implements MigrationInterface {
  name = 'SyncSessionSchema1783469172673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "sit" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "secret_hash" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sessions_user_sit" ON "sessions" ("user_id", "sit")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_user_sit"`);
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "secret_hash" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "sit"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Per-plan cap on saved résumés (upload or link):
 *   Free = 1 (delete to swap) · Starter = 5 · Pro = unlimited (-1).
 *
 * Added as a first-class column alongside repo_limit / generation_limit. The
 * DEFAULT 1 backfills existing rows to the Free cap; Starter/Pro are set below
 * (the plans seed early-returns once rows exist, so it can't update them).
 */
export class AddResumeLimit1783629700000 implements MigrationInterface {
  name = 'AddResumeLimit1783629700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "plans" ADD COLUMN "resume_limit" INT NOT NULL DEFAULT 1
    `);
    await queryRunner.query(
      `UPDATE "plans" SET "resume_limit" = 5  WHERE "tier" = 'starter'`,
    );
    await queryRunner.query(
      `UPDATE "plans" SET "resume_limit" = -1 WHERE "tier" = 'pro'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "resume_limit"`);
  }
}

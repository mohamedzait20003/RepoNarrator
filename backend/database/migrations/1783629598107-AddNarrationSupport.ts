import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema support for the two narration flows:
 *   • "Narrate about Repos"  → per-repo README   (kind = 'repo_readme', repo_id set)
 *   • "Narrate Yourself"     → profile README    (kind = 'profile', repo_id null)
 *
 * - generations.kind         discriminates the two; repo_id becomes nullable
 *   (a profile narration spans all repos, so it has no single target repo).
 * - A CHECK enforces the invariant (repo_readme ⇒ repo_id set, profile ⇒ null).
 * - usage_counters.profile_narrations_used tracks the separate profile-narration
 *   quota (PlanFeatures.profileNarrations), independent of generations_used.
 */
export class AddNarrationSupport1783629598107 implements MigrationInterface {
  name = 'AddNarrationSupport1783629598107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."generation_kind_enum" AS ENUM ('repo_readme', 'profile')
    `);

    await queryRunner.query(`
      ALTER TABLE "generations"
        ADD COLUMN "kind" "public"."generation_kind_enum" NOT NULL DEFAULT 'repo_readme'
    `);

    // A profile narration reads every repo — it has no single target repo.
    await queryRunner.query(`
      ALTER TABLE "generations" ALTER COLUMN "repo_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "generations"
        ADD CONSTRAINT "CHK_generations_kind_repo" CHECK (
          ("kind" = 'repo_readme' AND "repo_id" IS NOT NULL)
          OR ("kind" = 'profile' AND "repo_id" IS NULL)
        )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_generations_user_kind" ON "generations" ("user_id", "kind")
    `);

    await queryRunner.query(`
      ALTER TABLE "usage_counters"
        ADD COLUMN "profile_narrations_used" INT NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usage_counters" DROP COLUMN "profile_narrations_used"
    `);
    await queryRunner.query(`DROP INDEX "public"."IDX_generations_user_kind"`);
    await queryRunner.query(`
      ALTER TABLE "generations" DROP CONSTRAINT "CHK_generations_kind_repo"
    `);
    // Restore NOT NULL — safe only if no profile narrations exist (repo_id null).
    await queryRunner.query(`
      ALTER TABLE "generations" ALTER COLUMN "repo_id" SET NOT NULL
    `);
    await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "public"."generation_kind_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 1 of "Narrate Yourself":
 * - `google` added to the LLM provider enum.
 * - `ai_models` — admin-managed model catalog the LlmProviderFactory resolves.
 * - `generations` gains `intent` (user steer), `phase` (progress), and an
 *   `ai_model_id` FK (the chosen catalog model; provider/model text remain the
 *   run-time snapshot, so history survives catalog edits).
 */
export class AddAiModelsAndNarration1783718741161
  implements MigrationInterface
{
  name = 'AddAiModelsAndNarration1783718741161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."llm_provider_enum" ADD VALUE IF NOT EXISTS 'google'`,
    );

    await queryRunner.query(`
      CREATE TABLE "ai_models" (
        "id"             UUID        NOT NULL DEFAULT gen_random_uuid(),
        "provider"       "public"."llm_provider_enum" NOT NULL,
        "model_id"       TEXT        NOT NULL,
        "display_name"   TEXT        NOT NULL,
        "description"    TEXT,
        "tier"           "public"."model_tier_enum" NOT NULL DEFAULT 'economy',
        "is_enabled"     BOOLEAN     NOT NULL DEFAULT true,
        "is_default"     BOOLEAN     NOT NULL DEFAULT false,
        "context_window" INT,
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_models"                PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ai_models_provider_model" UNIQUE ("provider", "model_id")
      )
    `);

    await queryRunner.query(`ALTER TABLE "generations" ADD COLUMN "intent" TEXT`);
    await queryRunner.query(`ALTER TABLE "generations" ADD COLUMN "phase" TEXT`);
    await queryRunner.query(
      `ALTER TABLE "generations" ADD COLUMN "ai_model_id" UUID`,
    );
    await queryRunner.query(`
      ALTER TABLE "generations"
        ADD CONSTRAINT "FK_generations_ai_model"
        FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "generations" DROP CONSTRAINT "FK_generations_ai_model"`,
    );
    await queryRunner.query(
      `ALTER TABLE "generations" DROP COLUMN "ai_model_id"`,
    );
    await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "phase"`);
    await queryRunner.query(`ALTER TABLE "generations" DROP COLUMN "intent"`);
    await queryRunner.query(`DROP TABLE "ai_models"`);
    // Postgres can't drop a single enum value; 'google' stays on llm_provider_enum.
  }
}

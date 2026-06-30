import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."admin_role_enum" AS ENUM ('super_admin', 'support')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."plan_tier_enum" AS ENUM ('free', 'starter', 'pro')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."model_tier_enum" AS ENUM ('economy', 'standard', 'premium')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."subscription_status_enum" AS ENUM ('active', 'past_due', 'canceled', 'trialing')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."resume_source_enum" AS ENUM ('upload', 'link')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."generation_status_enum" AS ENUM ('queued', 'running', 'completed', 'failed')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."llm_provider_enum" AS ENUM ('anthropic', 'openai')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."push_mode_enum" AS ENUM ('manual', 'pr', 'direct')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "github_id"        BIGINT NOT NULL,
        "github_login"     TEXT NOT NULL,
        "email"            TEXT,
        "name"             TEXT,
        "avatar_url"       TEXT,
        "access_token_enc" TEXT,
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_github_id" UNIQUE ("github_id"),
        CONSTRAINT "UQ_users_email"     UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "admins" (
        "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
        "email"         TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "name"          TEXT,
        "role"          "public"."admin_role_enum" NOT NULL DEFAULT 'support',
        "last_login_at" TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ,
        CONSTRAINT "PK_admins"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admins_email" UNIQUE ("email"),
        CONSTRAINT "CHK_admins_email_domain" CHECK (email LIKE '%@reponarratoradmin.com')
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "plans" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "tier"             "public"."plan_tier_enum" NOT NULL,
        "price_monthly"    INT NOT NULL DEFAULT 0,
        "repo_limit"       INT NOT NULL DEFAULT 3,
        "generation_limit" INT NOT NULL DEFAULT 5,
        "model_tier"       "public"."model_tier_enum" NOT NULL DEFAULT 'economy',
        "model"            TEXT NOT NULL,
        "features"         JSONB NOT NULL,
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plans"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_plans_tier" UNIQUE ("tier")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id"                      UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"                 UUID NOT NULL,
        "plan_id"                 UUID NOT NULL,
        "status"                  "public"."subscription_status_enum" NOT NULL DEFAULT 'trialing',
        "stripe_customer_id"      TEXT,
        "stripe_subscription_id"  TEXT,
        "current_period_end"      TIMESTAMPTZ,
        "created_at"              TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"              TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions"     PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscriptions_user" UNIQUE ("user_id"),
        CONSTRAINT "FK_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_subscriptions_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "usage_counters" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"          UUID NOT NULL,
        "period_start"     DATE NOT NULL,
        "generations_used" INT NOT NULL DEFAULT 0,
        CONSTRAINT "PK_usage_counters"        PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usage_counters_period"  UNIQUE ("user_id", "period_start"),
        CONSTRAINT "FK_usage_counters_user"    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resumes" (
        "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"     UUID NOT NULL,
        "source"      "public"."resume_source_enum" NOT NULL,
        "file_url"    TEXT NOT NULL,
        "parsed_text" TEXT,
        "parsed_json" JSONB,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resumes"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_resumes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "repositories" (
        "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "github_repo_id"  BIGINT NOT NULL,
        "full_name"       TEXT NOT NULL,
        "default_branch"  TEXT NOT NULL DEFAULT 'main',
        "is_private"      BOOLEAN NOT NULL DEFAULT false,
        "last_analyzed_at" TIMESTAMPTZ,
        CONSTRAINT "PK_repositories"       PRIMARY KEY ("id"),
        CONSTRAINT "UQ_repositories_pair"  UNIQUE ("user_id", "github_repo_id"),
        CONSTRAINT "FK_repositories_user"  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "generations" (
        "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"       UUID NOT NULL,
        "repo_id"       UUID NOT NULL,
        "resume_id"     UUID,
        "status"        "public"."generation_status_enum" NOT NULL DEFAULT 'queued',
        "provider"      "public"."llm_provider_enum",
        "model"         TEXT,
        "push_mode"     "public"."push_mode_enum" NOT NULL DEFAULT 'manual',
        "generated_md"  TEXT,
        "pr_url"        TEXT,
        "commit_sha"    TEXT,
        "input_tokens"  INT,
        "output_tokens" INT,
        "error"         TEXT,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "completed_at"  TIMESTAMPTZ,
        CONSTRAINT "PK_generations"       PRIMARY KEY ("id"),
        CONSTRAINT "FK_generations_user"  FOREIGN KEY ("user_id")  REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_generations_repo"  FOREIGN KEY ("repo_id")  REFERENCES "repositories"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_generations_resume" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
        "admin_id"    UUID NOT NULL,
        "action"      TEXT NOT NULL,
        "target_type" TEXT,
        "target_id"   TEXT,
        "metadata"    JSONB,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs"       PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_admin" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "generations"`);
    await queryRunner.query(`DROP TABLE "repositories"`);
    await queryRunner.query(`DROP TABLE "resumes"`);
    await queryRunner.query(`DROP TABLE "usage_counters"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "plans"`);
    await queryRunner.query(`DROP TABLE "admins"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."push_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."llm_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."generation_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."resume_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."model_tier_enum"`);
    await queryRunner.query(`DROP TYPE "public"."plan_tier_enum"`);
    await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
  }
}

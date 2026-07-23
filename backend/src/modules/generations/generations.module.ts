import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { User } from '@/modules/identity/entities/user.entity';
import { Generation } from '@/modules/generations/entities/generation.entity';
import { Repo } from '@/modules/generations/entities/repo.entity';
import { AiModel } from '@/modules/subscription/entities/ai-model.entity';
import { Subscription } from '@/modules/subscription/entities/subscription.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AuthGuard } from '@/shared/Guards/auth.guard';
import { QuotaGuard } from '@/shared/Guards/quota.guard';
import { LlmProviderFactory } from '@/shared/Factories/llm-provider.factory';
import { PlanService } from '@/modules/subscription/services/plan.service';
import { QuotaService } from '@/modules/subscription/services/quota.service';

import { ReposController } from '@/modules/generations/controllers/repos.controller';
import { GithubReposService } from '@/modules/generations/services/github-repos.service';
import { RepoGenerationService } from '@/modules/generations/services/repo-generation.service';
import { NarrationController } from '@/modules/generations/controllers/narration.controller';
import { NarrationService } from '@/modules/generations/services/narration.service';
import { NarrationTailorService } from '@/modules/generations/services/narration-tailor.service';
import { GithubCommitService } from '@/modules/generations/services/github-commit.service';
import { ProfileGenerationFactory } from '@/modules/generations/factories/profile-generation.factory';
import { RepoGenerationFactory } from '@/modules/generations/factories/repo-generation.factory';
import { AiModelsController } from '@/modules/generations/controllers/ai-models.controller';
import { AiModelsService } from '@/modules/generations/services/ai-models.service';

/**
 * Generation module — repo listing + "Narrate Yourself" (profile README). The
 * heavy agentic job runs in the narration worker; this side enqueues + reports.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Generation,
      Repo,
      AiModel,
      Subscription,
      Plan,
      UsageCounter,
    ]),
    CacheModule.register({ ttl: 120_000 }),
    IdentityModule,
  ],
  controllers: [ReposController, NarrationController, AiModelsController],
  providers: [
    GithubReposService,
    RepoGenerationService,
    NarrationService,
    NarrationTailorService,
    GithubCommitService,
    ProfileGenerationFactory,
    RepoGenerationFactory,
    AiModelsService,
    LlmProviderFactory,
    PlanService,
    QuotaService,
    AuthGuard,
    QuotaGuard,
  ],
})
export class GenerationsModule {}

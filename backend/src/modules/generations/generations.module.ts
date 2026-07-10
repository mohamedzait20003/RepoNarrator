import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { User } from '@/modules/identity/entities/user.entity';
import { Generation } from '@/modules/generations/entities/generation.entity';
import { AiModel } from '@/modules/subscription/entities/ai-model.entity';
import { Subscription } from '@/modules/subscription/entities/subscription.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AuthGuard } from '@/shared/Guards/auth.guard';

import { ReposController } from '@/modules/generations/controllers/repos.controller';
import { GithubReposService } from '@/modules/generations/services/github-repos.service';
import { NarrationController } from '@/modules/generations/controllers/narration.controller';
import { NarrationService } from '@/modules/generations/services/narration.service';
import { NarrationQueue } from '@/modules/generations/queue/narration.queue';

/**
 * Generation module — repo listing + "Narrate Yourself" (profile README). The
 * heavy agentic job runs in the narration worker; this side enqueues + reports.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Generation,
      AiModel,
      Subscription,
      Plan,
      UsageCounter,
    ]),
    CacheModule.register({ ttl: 120_000 }),
    IdentityModule,
  ],
  controllers: [ReposController, NarrationController],
  providers: [GithubReposService, NarrationService, NarrationQueue, AuthGuard],
})
export class GenerationsModule {}

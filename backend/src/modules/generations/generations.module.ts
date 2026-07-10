import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { User } from '@/modules/identity/entities/user.entity';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AuthGuard } from '@/shared/Guards/auth.guard';

import { ReposController } from '@/modules/generations/controllers/repos.controller';
import { GithubReposService } from '@/modules/generations/services/github-repos.service';

/**
 * Generation module — repo listing today; per-repo README generation ("Narrate
 * about Repos") and profile narration ("Narrate Yourself") land here (Commit 5).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // Per-user repo-list cache (2 min) — keeps us under GitHub's rate limit.
    CacheModule.register({ ttl: 120_000 }),
    // Provides TOKEN_SERVICE (AuthGuard) + EncryptionService (token decrypt).
    IdentityModule,
  ],
  controllers: [ReposController],
  providers: [GithubReposService, AuthGuard],
})
export class GenerationsModule {}

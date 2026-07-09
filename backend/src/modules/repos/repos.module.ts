import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { User } from '@/modules/identity/entities/user.entity';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AuthGuard } from '@/shared/Guards/auth.guard';

import { ReposController } from '@/modules/repos/controllers/repos.controller';
import { GithubReposService } from '@/modules/repos/services/github-repos.service';

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
export class ReposModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { User } from '../identity/entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Plan } from '../subscription/entities/plan.entity';
import { UsageCounter } from '../subscription/entities/usage-counter.entity';
import { Repo } from '../generations/entities/repo.entity';
import { Generation } from '../generations/entities/generation.entity';

import { IdentityModule } from '../identity/identity.module';
import { AuthGuard } from '../../shared/Guards/auth.guard';

import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Subscription,
      Plan,
      UsageCounter,
      Repo,
      Generation,
    ]),
    CacheModule.register({ ttl: 30_000 }),
    IdentityModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, AuthGuard],
})
export class AnalyticsModule {}

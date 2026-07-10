import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resume } from '@/modules/resumes/entities/resume.entity';
import { Subscription } from '@/modules/subscription/entities/subscription.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AuthGuard } from '@/shared/Guards/auth.guard';

import { ResumeController } from '@/modules/resumes/controllers/resume.controller';
import { ResumeService } from '@/modules/resumes/services/resume.service';
import { R2StorageService } from '@/modules/resumes/services/r2-storage.service';

/** Résumé storage — upload or link, capped per plan (Plan.resumeLimit). */
@Module({
  imports: [
    // Subscription + Plan power the per-plan résumé cap.
    TypeOrmModule.forFeature([Resume, Subscription, Plan]),
    // Provides TOKEN_SERVICE for AuthGuard.
    IdentityModule,
  ],
  controllers: [ResumeController],
  providers: [ResumeService, R2StorageService, AuthGuard],
})
export class ResumesModule {}

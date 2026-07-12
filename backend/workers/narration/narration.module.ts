import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Generation } from '@/modules/generations/entities/generation.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { User } from '@/modules/identity/entities/user.entity';
import { Resume } from '@/modules/resumes/entities/resume.entity';
import { EncryptionService } from '@/modules/identity/services/encryption.service';
import { R2StorageService } from '@/modules/resumes/services/r2-storage.service';
import { LlmProviderFactory } from '@/shared/Factories/llm-provider.factory';
import { ResumeTextService } from './services/resume-text.service';
import { GithubReaderService } from './services/github-reader.service';
import { NarrationContextService } from './services/narration-context.service';
import { NarrationAgentService } from './services/narration-agent.service';
import { NarrationRunner } from './services/narration-runner.service';

/**
 * Narration worker providers. The DB connection + config come from the parent
 * {@link WorkersModule}; this only registers the repositories + services it uses.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Generation, UsageCounter, User, Resume])],
  providers: [
    NarrationRunner,
    NarrationContextService,
    GithubReaderService,
    ResumeTextService,
    R2StorageService,
    EncryptionService,
    LlmProviderFactory,
    NarrationAgentService,
  ],
  exports: [NarrationRunner],
})
export class NarrationWorkerModule {}

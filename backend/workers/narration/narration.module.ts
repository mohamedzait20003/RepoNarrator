import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from '@/shared/Configuration/configuration';
import { ENTITIES } from '@/shared/Database/entities';
import { Generation } from '@/modules/generations/entities/generation.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { User } from '@/modules/identity/entities/user.entity';
import { Resume } from '@/modules/resumes/entities/resume.entity';
import { EncryptionService } from '@/modules/identity/services/encryption.service';
import { R2StorageService } from '@/modules/resumes/services/r2-storage.service';
import { ResumeTextService } from './services/resume-text.service';
import { GithubReaderService } from './services/github-reader.service';
import { NarrationContextService } from './services/narration-context.service';
import { LlmProviderFactory } from '@/shared/Factories/llm-provider.factory';
import { NarrationAgentService } from './services/narration-agent.service';
import { NarrationRunner } from './services/narration-runner.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: ENTITIES,
        synchronize: false,
        logging: ['error'],
      }),
    }),
    TypeOrmModule.forFeature([Generation, UsageCounter, User, Resume]),
  ],
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

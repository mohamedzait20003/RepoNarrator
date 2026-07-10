import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from '@/shared/Configuration/configuration';
import { ENTITIES } from '@/shared/Database/entities';
import { Generation } from '@/modules/generations/entities/generation.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { NarrationRunner } from './services/narration-runner.service';

/**
 * NestJS application context for the narration worker. Unlike the mail worker it
 * needs the database (to update generations + refund quota), so it wires the
 * same entity set and reuses the app's configuration loader.
 */
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
    TypeOrmModule.forFeature([Generation, UsageCounter]),
  ],
  providers: [NarrationRunner],
  exports: [NarrationRunner],
})
export class NarrationWorkerModule {}

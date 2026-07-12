import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from '@/shared/Configuration/configuration';
import { ENTITIES } from '@/shared/Database/entities';
import { MailWorkerModule } from './mail/mail.module';
import { NarrationWorkerModule } from './narration/narration.module';

/**
 * Single application context for all background workers. Sets up config + the
 * database connection once, then imports each worker's feature module. The
 * bootstrap ({@link file://./main.ts}) starts every BullMQ consumer from here.
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
    MailWorkerModule,
    NarrationWorkerModule,
  ],
})
export class WorkersModule {}

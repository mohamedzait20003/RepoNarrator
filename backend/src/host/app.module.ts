import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import type { LoggerOptions } from 'typeorm';
import configuration from '@/shared/Configuration/configuration';
import { ENTITIES } from '@/shared/Database/entities';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { GenerationsModule } from '@/modules/generations/generations.module';
import { ResumesModule } from '@/modules/resumes/resumes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: ENTITIES,
        migrations: [__dirname + '/../../database/migrations/*.{ts,js}'],
        synchronize: false,
        logging: (config.get('nodeEnv') === 'development'
          ? ['error', 'warn']
          : ['error']) as LoggerOptions,
      }),
    }),

    IdentityModule,
    AnalyticsModule,
    GenerationsModule,
    ResumesModule,
  ],
})
export class AppModule {}

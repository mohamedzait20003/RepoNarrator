import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { LoggerOptions } from 'typeorm';
import configuration from '../shared/Configuration/configuration';
import { User } from '../modules/identity/entities/user.entity';
import { UserProfile } from '../modules/identity/entities/user-profile.entity';
import { Token } from '../modules/identity/entities/token.entity';
import { Session } from '../modules/identity/entities/session.entity';
import { Plan } from '../modules/subscription/entities/plan.entity';
import { Subscription } from '../modules/subscription/entities/subscription.entity';
import { UsageCounter } from '../modules/subscription/entities/usage-counter.entity';
import { Resume } from '../modules/resumes/entities/resume.entity';
import { Repo } from '../modules/generations/entities/repo.entity';
import { Generation } from '../modules/generations/entities/generation.entity';
import { AuditLog } from '../modules/analytics/entities/audit-log.entity';

const ENTITIES = [
  User,
  UserProfile,
  Token,
  Session,
  Plan,
  Subscription,
  UsageCounter,
  Resume,
  Repo,
  Generation,
  AuditLog,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

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
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../shared/Configuration/configuration';
import { User } from '../modules/users/entities/user.entity';
import { Admin } from '../modules/admin/entities/admin.entity';
import { Plan } from '../modules/plans/entities/plan.entity';
import { Subscription } from '../modules/subscriptions/entities/subscription.entity';
import { UsageCounter } from '../modules/subscriptions/entities/usage-counter.entity';
import { Resume } from '../modules/resumes/entities/resume.entity';
import { Repo } from '../modules/repos/entities/repo.entity';
import { Generation } from '../modules/generations/entities/generation.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';

const ENTITIES = [User, Admin, Plan, Subscription, UsageCounter, Resume, Repo, Generation, AuditLog];

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
        logging: config.get('nodeEnv') === 'development' ? (['error', 'warn'] as any) : (['error'] as any),
      }),
    }),
  ],
})
export class AppModule {}

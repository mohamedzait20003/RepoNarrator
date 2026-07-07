import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

dotenv.config({ path: resolve(__dirname, '.env') });

import { User } from './src/modules/identity/entities/user.entity';
import { UserProfile } from './src/modules/identity/entities/profile.entity';
import { Token } from './src/modules/identity/entities/token.entity';
import { Session } from './src/modules/identity/entities/session.entity';
import { Plan } from './src/modules/subscription/entities/plan.entity';
import { Subscription } from './src/modules/subscription/entities/subscription.entity';
import { UsageCounter } from './src/modules/subscription/entities/usage-counter.entity';
import { Resume } from './src/modules/resumes/entities/resume.entity';
import { Repo } from './src/modules/generations/entities/repo.entity';
import { Generation } from './src/modules/generations/entities/generation.entity';
import { AuditLog } from './src/modules/analytics/entities/audit-log.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
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
  ],
  migrations: [__dirname + '/database/migrations/*.{ts,js}'],
  synchronize: false,
  logging:
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default AppDataSource;

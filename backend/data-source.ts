import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

// Load .env from repo root so the CLI has DATABASE_URL without a running Nest app.
dotenv.config({ path: resolve(__dirname, '../.env') });

import { User } from './src/modules/users/entities/user.entity';
import { Admin } from './src/modules/admin/entities/admin.entity';
import { Plan } from './src/modules/plans/entities/plan.entity';
import { Subscription } from './src/modules/subscriptions/entities/subscription.entity';
import { UsageCounter } from './src/modules/subscriptions/entities/usage-counter.entity';
import { Resume } from './src/modules/resumes/entities/resume.entity';
import { Repo } from './src/modules/repos/entities/repo.entity';
import { Generation } from './src/modules/generations/entities/generation.entity';
import { AuditLog } from './src/modules/audit/entities/audit-log.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Admin, Plan, Subscription, UsageCounter, Resume, Repo, Generation, AuditLog],
  migrations: [__dirname + '/database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default AppDataSource;

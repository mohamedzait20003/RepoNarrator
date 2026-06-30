import 'reflect-metadata';
import AppDataSource from '../../data-source';
import { seedPlans } from './plans.seed';

async function main() {
  await AppDataSource.initialize();
  try {
    await seedPlans(AppDataSource);
    console.log('Seed complete.');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

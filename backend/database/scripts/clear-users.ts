import 'reflect-metadata';
import AppDataSource from '../../data-source';

/**
 * Removes every user and all cascaded user-owned data (profiles, sessions,
 * tokens, subscriptions, résumés, repos, generations, usage). Catalog tables
 * (plans, ai_models) are left intact. Destructive — dev/testing only.
 */
async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    await AppDataSource.query('TRUNCATE TABLE "users" CASCADE');
    console.log('All users removed (users + cascaded user data).');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Clear users failed:', err);
  process.exit(1);
});

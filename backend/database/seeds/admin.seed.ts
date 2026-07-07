import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../../src/modules/identity/entities/user.entity';
import { UserProfile } from '../../src/modules/identity/entities/profile.entity';
import { UserRole } from '../../src/shared/Domain';

const BCRYPT_ROUNDS = 12;

/**
 * Seeds the first super-admin. Idempotent — skips if the account already exists.
 *
 * Credentials come from the environment (with dev defaults):
 *   SEED_ADMIN_EMAIL     (default admin@<ADMIN_EMAIL_DOMAIN>)
 *   SEED_ADMIN_PASSWORD  (default ChangeMe!123 — change it immediately)
 *   SEED_ADMIN_NAME      (default "RepoNarrator Admin")
 *
 * This is the only path that creates admin accounts: normal sign-up rejects the
 * admin email domain, so support / super_admin users must be seeded (or, later,
 * invited by an existing admin).
 */
export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(User);
  const profiles = dataSource.getRepository(UserProfile);

  const domain = process.env.ADMIN_EMAIL_DOMAIN ?? 'reponarratoradmin.com';
  const email = process.env.SEED_ADMIN_EMAIL ?? `admin@${domain}`;
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!123';
  const name = process.env.SEED_ADMIN_NAME ?? 'RepoNarrator Admin';

  if (!email.endsWith(`@${domain}`)) {
    throw new Error(`SEED_ADMIN_EMAIL must belong to @${domain}.`);
  }

  const existing = await users.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
    return;
  }

  const user = await users.save(
    users.create({
      email,
      name,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: UserRole.SUPER_ADMIN,
      emailVerifiedAt: new Date(),
    }),
  );

  // Paired profile (shared PK), same as the runtime sign-up path.
  await profiles.save(profiles.create({ id: user.id }));

  console.log(`Super admin seeded: ${email}`);
}

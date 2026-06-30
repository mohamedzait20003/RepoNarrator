import { DataSource } from 'typeorm';
import { Plan } from '../../src/modules/plans/entities/plan.entity';
import { ModelTier, PlanTier } from '../../src/shared/Domain';

export async function seedPlans(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Plan);
  const existing = await repo.count();
  if (existing > 0) return;

  await repo.save([
    {
      tier: PlanTier.FREE,
      priceMonthly: 0,
      repoLimit: 3,
      generationLimit: 5,
      modelTier: ModelTier.ECONOMY,
      model: 'claude-haiku-4-5-20251001',
      features: {
        privateRepos: false,
        bulkGenerate: false,
        directPush: false,
        watermark: true,
        customTemplates: 0,
        historyRetentionDays: 7,
        apiAccess: false,
      },
    },
    {
      tier: PlanTier.STARTER,
      priceMonthly: 900,
      repoLimit: 25,
      generationLimit: 75,
      modelTier: ModelTier.STANDARD,
      model: 'claude-sonnet-4-6',
      features: {
        privateRepos: true,
        bulkGenerate: false,
        directPush: false,
        watermark: false,
        customTemplates: 1,
        historyRetentionDays: 90,
        apiAccess: false,
      },
    },
    {
      tier: PlanTier.PRO,
      priceMonthly: 2900,
      repoLimit: -1,
      generationLimit: 750,
      modelTier: ModelTier.PREMIUM,
      model: 'claude-opus-4-8',
      features: {
        privateRepos: true,
        bulkGenerate: true,
        directPush: true,
        watermark: false,
        customTemplates: -1,
        historyRetentionDays: -1,
        apiAccess: true,
      },
    },
  ]);

  console.log('Plans seeded.');
}

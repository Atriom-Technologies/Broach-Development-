import { PrismaClient } from '@prisma/client';
import { AppLogger } from 'src/logger/logger.service';
import { SafeExecutor } from 'src/utils/safe-execute';

// Initialization
const prisma: PrismaClient = new PrismaClient();
const logger = new AppLogger();
const safeExecutor = new SafeExecutor(logger);

// Predefined enums that populate necessary tables
const seedData = {
  sectors: [
    'mental_health',
    'legal_assistance',
    'gender_based_advocacy',
    'human_rights',
    'child_rights',
    'crisis_support',
    'social_welfare_and_Livelihood_support_services',
    'health_medical_services',
    'community_advocacy',
    'disability_and_inclusion',
    'technology_and_digital_rights',
    'health_and_rehabilitation_services',
    'others',
  ],

  caseTypes: [
    'sexual_assault',
    'physical_assault',
    'psychological_emotional_abuse',
    'female_genital_mutilation',
    'child_abuse',
    'forced_marriage',
    'online_cyberspace',
    'property_dispute',
    'others',
  ],

  serviceTypes: [
    'mental_health_counsel_therapy',
    'social_welfare',
    'rehabilitation_services',
    'health_medical_services',
    'housing_shelter_support',
    'legal_assistance',
    'domestic_violence_support',
    'educational_support',
    'disability_support_services',
    'refugee_displaced_people_support',
  ],

  vulnerabilityStatuses: [
    'not_applicable',
    'mentally_disabled',
    'physically_disabled',
    'HIV_positive',
    'internally_displaced',
    'widow_widower',
    'minor_orphan',
  ],
};

// ✅ A reusable function to seed enum tables safely
async function seedEnumTable<K extends keyof typeof seedData>(
  modelName: K,
  tableName: 'sector' | 'caseType' | 'serviceType' | 'vulnerabilityStatus', // restrict to known table names
): Promise<void> {
  await safeExecutor.run(async () => {
    const data = seedData[modelName].map((name) => ({ name }));

    // ✅ Type-safe access to Prisma model
    const model = (
      prisma as unknown as Record<
        typeof tableName,
        { createMany: (args: unknown) => Promise<unknown> }
      >
    )[tableName];

    await model.createMany({ data, skipDuplicates: true });
    logger.verbose(`✅ ${tableName} seeded successfully`);
  }, `Failed to seed ${tableName}`);
}

// ✅ Seed execution
async function main(): Promise<void> {
  await seedEnumTable('sectors', 'sector');
  await seedEnumTable('caseTypes', 'caseType');
  await seedEnumTable('serviceTypes', 'serviceType');
  await seedEnumTable('vulnerabilityStatuses', 'vulnerabilityStatus');
}

main()
  .catch((e) => {
    logger.error('Unexpected error during seeding', (e as Error).stack);
  })
  .finally(() => {
    void prisma.$disconnect(); // ✅ no Promise returned to ESLint
  });

/* import { PrismaClient } from '@prisma/client';
import { AppLogger } from 'src/logger/logger.service';
import { SafeExecutor } from 'src/utils/safe-execute';

// Initialization
const prisma: PrismaClient = new PrismaClient();
const logger = new AppLogger();
const safeExecutor = new SafeExecutor(logger);

// Predefined enums that populate necessary tables
const seedData = {
  sectors: [
    'mental_health',
    'legal_assistance',
    'gender_based_advocacy',
    'human_rights',
    'child_rights',
    'crisis_support',
    'social_welfare_and_Livelihood_support_services',
    'health_medical_services',
    'community_advocacy',
    'disability_and_inclusion',
    'technology_and_digital_rights',
    'health_and_rehabilitation_services',
    'others',
  ],

  caseTypes: [
    'sexual_assault',
    'physical_assault',
    'psychological_emotional_abuse',
    'female_genital_mutilation',
    'child_abuse',
    'forced_marriage',
    'online_cyberspace',
    'property_dispute',
    'others',
  ],

  serviceTypes: [
    'mental_health_counsel_therapy',
    'social_welfare',
    'rehabilitation_services',
    'health_medical_services',
    'housing_shelter_support',
    'legal_assistance',
    'domestic_violence_support',
    'educational_support',
    'disability_support_services',
    'refugee_displaced_people_support',
  ],

  vulnerabilityStatuses: [
    'not_applicable',
    'mentally_disabled',
    'physically_disabled',
    'HIV_positive',
    'internally_displaced',
    'widow_widower',
    'minor_orphan',
  ],
};

// ✅ A reusable function to seed enum tables safely
async function seedEnumTable<K extends keyof typeof seedData>(
  modelName: K,
  tableName:
    | 'sector'
    | 'caseType'
    | 'serviceType'
    | 'vulnerabilityStatus', // restrict to known table names
): Promise<void> {
  await safeExecutor.run(
    async () => {
      const data = seedData[modelName].map((name) => ({ name }));

      // ✅ Type-safe access to Prisma model
      const model = (prisma as unknown as Record<
        typeof tableName,
        { createMany: (args: unknown) => Promise<unknown> }
      >)[tableName];

      await model.createMany({ data, skipDuplicates: true });
      logger.verbose(`✅ ${tableName} seeded successfully`);
    },
    `Failed to seed ${tableName}`,
  );
}

// ✅ Seed execution
async function main(): Promise<void> {
  await seedEnumTable('sectors', 'sector');
  await seedEnumTable('caseTypes', 'caseType');
  await seedEnumTable('serviceTypes', 'serviceType');
  await seedEnumTable('vulnerabilityStatuses', 'vulnerabilityStatus');
}

main()
  .catch((e) => {
    logger.error('Unexpected error during seeding', (e as Error).stack);
  })
  .finally(() => {
    void prisma.$disconnect(); // ✅ no Promise returned to ESLint
  });
 */

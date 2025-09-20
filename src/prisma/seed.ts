import { PrismaClient } from "@prisma/client";
import { AppLogger } from "src/logger/logger.service";
import { SafeExecutor } from "src/utils/safe-execute";

// Initialization
const prisma = new PrismaClient();
const logger = new AppLogger();

// a wrapper around a function to safely run and log erros properly
const safeExecutor = new SafeExecutor(logger);

// Predefiened enums that would populate necessary tables
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
]
}

// A reusable seed function to seed enum tables
async function seedEnumTable(
  modelName: keyof typeof seedData, // model name must be one of the keys of seed data above
  tableName: string, // Prisma model name to write to e.g sectors, casetypes etc..
) {
  // Wrap the whole async logic
  await safeExecutor.run(async () => {
    const data = seedData[modelName].map((name) => ({ name }));
    await prisma[tableName].createMany({ data, skipDuplicates: true });
    logger.verbose(`✅ ${tableName} seeded successfully`);
  }, `Failed to seed ${tableName}`);
}


// Seed execution 
async function main() {
  await seedEnumTable("sectors", "sector");
  await seedEnumTable("caseTypes", "caseType");
  await seedEnumTable("serviceTypes", "serviceType");
  await seedEnumTable("vulnerabilityStatuses", "vulnerabilityStatus");
}

main()
  .catch((e) => logger.error("Unexpected error during seeding", (e as Error).stack))
  .finally(async () => await prisma.$disconnect());

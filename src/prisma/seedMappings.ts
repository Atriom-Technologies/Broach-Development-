import { PrismaClient } from '@prisma/client';
import { AppLogger } from 'src/logger/logger.service';
import { SafeExecutor } from 'src/utils/safe-execute';

// Init
const prisma = new PrismaClient();
const logger = new AppLogger();
const safeExecutor = new SafeExecutor(logger);

const mappings = {
  TypeOfService: {
    mental_health_counsel_therapy: [
      'mental_health',
      'health_and_rehabilitation_services',
    ],
    social_welfare: [
      'social_welfare_and_Livelihood_support_services',
      'crisis_support',
    ],
    rehabilitation_services: [
      'health_and_rehabilitation_services',
      'mental_health',
    ],
    health_medical_services: ['health_medical_services', 'human_rights'],
    housing_shelter_support: [
      'crisis_support',
      'social_welfare_and_Livelihood_support_services',
    ],
    legal_assistance: ['legal_assistance', 'human_rights'],
    domestic_violence_support: [
      'gender_based_advocacy',
      'crisis_support',
      'legal_assistance',
    ],
    educational_support: [
      'social_welfare_and_Livelihood_support_services',
      'child_rights',
      'community_advocacy',
    ],
    disability_support_services: ['disability_and_inclusion', 'child_rights'],
    refugee_displaced_people_support: [
      'human_rights',
      'social_welfare_and_Livelihood_support_services',
      'crisis_support',
    ],
  },
  TypeOfCase: {
    sexual_assault: [
      'gender_based_advocacy',
      'legal_assistance',
      'crisis_support',
      'health_medical_services',
      'mental_health',
    ],
    physical_assault: [
      'crisis_support',
      'health_medical_services',
      'legal_assistance',
      'health_and_rehabilitation_services',
    ],
    psychological_emotional_abuse: [
      'mental_health',
      'gender_based_advocacy',
      'crisis_support',
    ],
    female_genital_mutilation: [
      'gender_based_advocacy',
      'child_rights',
      'health_medical_services',
      'community_advocacy',
    ],
    child_abuse: [
      'child_rights',
      'legal_assistance',
      'crisis_support',
      'mental_health',
    ],
    forced_marriage: [
      'gender_based_advocacy',
      'legal_assistance',
      'child_rights',
      'human_rights',
    ],
    online_cyberspace: [
      'technology_and_digital_rights',
      'human_rights',
      'community_advocacy',
    ],
    property_dispute: [
      'legal_assistance',
      'social_welfare_and_Livelihood_support_services',
    ],
    others: ['others', 'community_advocacy'],
  },
};

/**
 * Seeds CaseType ↔ Sector mappings based on predefined configuration.
 *
 * Each CaseType (e.g "sexual_assault") can be linked to one or more Sectors 
 * (e.g "mental_health", "legal_assistance"). These mappings determine
 * which support organization sectors should receive a case report of a given type.
 *
 * Example:
 *   CaseType: "child_abuse"
 *   Sectors:  ["child_rights", "legal_assistance", "crisis_support", "mental_health"]
 *
 * This function uses Prisma's `upsert` method to ensure idempotency:
 * - If a mapping already exists → no duplication occurs.
 * - If missing → it is created.
 *
 * The SafeExecutor wrapper ensures that all errors are caught and logged
 * via the centralized AppLogger without halting other operations.
 */
async function seedCaseTypeMappings() {
  await safeExecutor.run(async () => {
    for (const [caseTypeName, sectorNames] of Object.entries(mappings.TypeOfCase)) {
      // Find the CaseType record by name
      const caseType = await prisma.caseType.findUnique({ where: { name: caseTypeName } });
      if (!caseType) {
        logger.warn(`CaseType '${caseTypeName}' not found — skipping`);
        continue;
      }

      // For each related sector name, fetch the sector and upsert mapping
      for (const sectorName of sectorNames) {
        const sector = await prisma.sector.findUnique({ where: { name: sectorName } });
        if (!sector) {
          logger.warn(`Sector '${sectorName}' not found — skipping`);
          continue;
        }

        // Create or update (no-op update) the mapping in CaseTypeSector table
        await prisma.caseTypeSector.upsert({
          where: {
            caseTypeId_sectorId: {
              caseTypeId: caseType.id,
              sectorId: sector.id,
            },
          },
          update: {},
          create: {
            caseTypeId: caseType.id,
            sectorId: sector.id,
          },
        });
      }
    }

    logger.verbose('CaseType-to-Sector mappings seeded successfully');
  }, 'Failed to seed CaseTypeSector mappings');
}

/**
 * Seeds ServiceType ↔ Sector mappings based on predefined configuration.
 *
 * Each ServiceType (e.g., "mental_health_counsel_therapy") can be linked
 * to multiple Sectors (e.g., "mental_health", "health_and_rehabilitation_services").
 * These mappings determine which organizations are relevant for a given
 * type of service request.
 *
 * The same SafeExecutor and upsert pattern ensures:
 * - Safe error handling and logging.
 * - Idempotent data seeding (no duplicates even if re-run).
 */
async function seedServiceTypeMappings() {
  await safeExecutor.run(async () => {
    for (const [serviceTypeName, sectorNames] of Object.entries(mappings.TypeOfService)) {
      // Find the ServiceType record by name
      const serviceType = await prisma.serviceType.findUnique({ where: { name: serviceTypeName } });
      if (!serviceType) {
        logger.warn(`ServiceType '${serviceTypeName}' not found — skipping`);
        continue;
      }

      // For each related sector name, fetch and link to ServiceType
      for (const sectorName of sectorNames) {
        const sector = await prisma.sector.findUnique({ where: { name: sectorName } });
        if (!sector) {
          logger.warn(`Sector '${sectorName}' not found — skipping`);
          continue;
        }

        // Upsert ensures one record per (serviceTypeId, sectorId) pair
        await prisma.serviceTypeSector.upsert({
          where: {
            serviceTypeId_sectorId: {
              serviceTypeId: serviceType.id,
              sectorId: sector.id,
            },
          },
          update: {},
          create: {
            serviceTypeId: serviceType.id,
            sectorId: sector.id,
          },
        });
      }
    }

    logger.verbose('ServiceType-to-Sector mappings seeded successfully');
  }, 'Failed to seed ServiceTypeSector mappings');
}

/**
 * Entrypoint for seeding all mapping relationships.
 *
 * - Logs the process start and completion.
 * - Executes seeding of both CaseType↔Sector and ServiceType↔Sector mappings sequentially.
 * - Uses SafeExecutor wrappers to ensure stability even if partial failures occur.
 */
async function main() {
  logger.verbose('Starting mapping seed...');
  await seedCaseTypeMappings();
  await seedServiceTypeMappings();
  logger.verbose('All mappings seeded successfully.');
}

// Execute the seeding process with global error handling and graceful disconnect.
main()
  .catch((err) => {
    logger.error('Unexpected error during mapping seed', (err as Error).stack);
  })
  .finally(() => {
    void prisma.$disconnect(); // ensure Prisma disconnects cleanly even on failure
  });

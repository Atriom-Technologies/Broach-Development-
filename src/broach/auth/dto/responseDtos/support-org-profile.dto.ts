// export class SupportOrgProfileDto {
//   id: string;
//   organizationName: string;
//   sector: string;
//   customSector?: string;
//   dateEstablished: Date;
//   organizationSize: string;
//   alternatePhone?: string;
//   organizationLogo?: string;
//   userId: string;
// }

// // SupportOrgProfileDto updated to perfectly align with your Prisma model
export class SupportOrgProfileDto {
  id!: string;
  organizationName!: string;
  sector!: string;
  customSector?: string;
  dateEstablished!: Date;
  organizationSize!: string;
  address?: string; // Added to fix the property error
  alternatePhone?: string;
  organizationLogoUrl?: string; // Renamed to match Prisma model
  coverPhotoUrl?: string; // Added for symmetry
  userId!: string;
}

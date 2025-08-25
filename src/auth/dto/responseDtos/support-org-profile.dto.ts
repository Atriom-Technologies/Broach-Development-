export class SupportOrgProfileDto {
  id: string;
  fullName: string;
  sector: string;
  customSector?: string;
  dateEstablished: Date;
  organizationSize: string;
  alternatePhone?: string;
  organizationLogo?: string;
  userId: string;
}

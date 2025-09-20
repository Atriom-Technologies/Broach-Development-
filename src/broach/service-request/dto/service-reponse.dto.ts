// import {
//   CaseStatus,
//   TypeOfService,
//   MaritalStatus,
//   EmploymentStatus,
//   VulnerabilityStatus,
//   WhoIsReporting,
//   AgeRange,
// } from '@prisma/client';

// export class ServiceDetailsResponseDto {
//   typeOfService: TypeOfService;
//   maritalStatus: MaritalStatus;
//   workStatus: EmploymentStatus;
//   vulnerabilityStatus: VulnerabilityStatus;
//   description: string;
// }

// export class BioDetailsResponseDto {
//   id: string;
//   whoNeedsThisService: WhoIsReporting;
//   ageRange?: AgeRange;
//   phone?: string;
//   email?: string;
//   infoConfirmed: boolean;
//   caseStatus: CaseStatus;
//   createdAt: Date;
//   updatedAt: Date;

//   serviceDetails: ServiceDetailsResponseDto;
// }
// /*
// export class ApiMessage {
//   title: string;
//   body: string;
// }

// export class ApiResponse<T = any> {
//   success: boolean;
//   message: ApiMessage;
//   data?: T; // Optional, if you want to return the created entity
// }
// */
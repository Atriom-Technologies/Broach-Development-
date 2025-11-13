// meta.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class EnumsDto {
  @ApiProperty({ example: ['requester_reporter', 'support_organization'] })
  UserType: string[];

  @ApiProperty({ example: ['male', 'female'] })
  Gender: string[];

  @ApiProperty({ example: ['size_5_10','size_10_20','size_20_50','size_50_plus'] })
  OrgSize: string[];

  @ApiProperty({ example: ['self','parent_guardian','spouse','witness','others'] })
  WhoIsReporting: string[];

  @ApiProperty({ example: ['victim_home','perpetrator_home','neutral_location','school','workspace','online','others'] })
  Location: string[];

  @ApiProperty({ example: ['pending','in_discussion','resolved','closed'] })
  CaseStatus: string[];

  @ApiProperty({ example: ['less_than_18','from_18_to_25','from_26_to_35','from_36_to_45','above_45'] })
  AgeRange: string[];

  @ApiProperty({ example: ['employed','unemployed','self_employed'] })
  EmploymentStatus: string[];

  @ApiProperty({ example: ['less_than_2','from_2_5','from_5_10','over_10'] })
  NoOfAssailants: string[];

  @ApiProperty({ example: ['single','married','separated','divorced'] })
  MaritalStatus: string[];
}


export class LookupTableDto {
  @ApiProperty({ type: [Object], example: [{ id: 'uuid', name: 'Health' }] })
  sectors: { id: string; name: string }[];

  @ApiProperty({ type: [Object], example: [{ id: 'uuid', name: 'Domestic Violence' }] })
  caseTypes: { id: string; name: string }[];

  @ApiProperty({ type: [Object], example: [{ id: 'uuid', name: 'Counseling' }] })
  serviceTypes: { id: string; name: string }[];

  @ApiProperty({ type: [Object], example: [{ id: 'uuid', name: 'High Vulnerability' }] })
  vulnerabilityStatuses: { id: string; name: string }[];
}

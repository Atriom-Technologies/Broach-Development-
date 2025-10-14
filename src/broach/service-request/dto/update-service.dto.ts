import { PartialType } from '@nestjs/mapped-types';
import { BioDetailsDto } from './create-service-request.dto';

export class UpdateServiceDto extends PartialType(BioDetailsDto) {}

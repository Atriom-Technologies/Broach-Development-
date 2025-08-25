import { Test, TestingModule } from '@nestjs/testing';
import { SupportOrgService } from './support-org.service';

describe('SupportOrgService', () => {
  let service: SupportOrgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportOrgService],
    }).compile();

    service = module.get<SupportOrgService>(SupportOrgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

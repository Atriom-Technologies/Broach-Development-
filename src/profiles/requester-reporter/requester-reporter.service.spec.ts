import { Test, TestingModule } from '@nestjs/testing';
import { RequesterReporterService } from './requester-reporter.service';

describe('RequesterReporterService', () => {
  let service: RequesterReporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequesterReporterService],
    }).compile();

    service = module.get<RequesterReporterService>(RequesterReporterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

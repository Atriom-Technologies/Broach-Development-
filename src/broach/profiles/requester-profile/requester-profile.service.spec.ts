import { Test, TestingModule } from '@nestjs/testing';
import { RequesterProfileService } from './requester-profile.service';

describe('RequesterProfileService', () => {
  let service: RequesterProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequesterProfileService],
    }).compile();

    service = module.get<RequesterProfileService>(RequesterProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

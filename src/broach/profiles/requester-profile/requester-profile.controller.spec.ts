import { Test, TestingModule } from '@nestjs/testing';
import { RequesterProfileController } from './requester-profile.controller';

describe('RequesterProfileController', () => {
  let controller: RequesterProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequesterProfileController],
    }).compile();

    controller = module.get<RequesterProfileController>(
      RequesterProfileController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

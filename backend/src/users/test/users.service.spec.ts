import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleAsyncProvider } from '../../drizzle/drizzle.provider';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockDrizzle = {
    query: jest.fn(),
    // Add other methods you use in your service
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DrizzleAsyncProvider,
          useValue: mockDrizzle,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

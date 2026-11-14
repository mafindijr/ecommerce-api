import { Test, TestingModule } from '@nestjs/testing';
import { StockReservationsService } from './stock-reservations.service';

describe('StockReservationsService', () => {
  let service: StockReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockReservationsService],
    }).compile();

    service = module.get<StockReservationsService>(StockReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

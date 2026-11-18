import { Test, TestingModule } from '@nestjs/testing';
import { StockReservationsController } from './stock-reservations.controller';

describe('StockReservationsController', () => {
  let controller: StockReservationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockReservationsController],
    }).compile();

    controller = module.get<StockReservationsController>(StockReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

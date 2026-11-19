import { BadRequestException, Injectable, InternalServerErrorException,
 } from '@nestjs/common';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgTransaction } from 'drizzle-orm/node-postgres';
import { and, eq, sql,  lte, } from 'drizzle-orm';
import type * as schema from '../db/schema';

import {
  productVariants,
  stockReservations,
  stockReservationItems,
} from '../db/schema';

type DbTransaction = NodePgTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

@Injectable()
export class StockReservationsService {

  // Reserve stock for one product variant.
  async reserveVariantStock(
    tx: DbTransaction,
    variantId: number,
    quantity: number,
  ) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Invalid reservation quantity');
    }

    const [updatedVariant] = await tx
      .update(productVariants)
      .set({
        reservedStock: sql`${productVariants.reservedStock} + ${quantity}`,
      })
      .where(
        and(
          eq(productVariants.id, variantId),
          sql`${productVariants.stock} - ${productVariants.reservedStock} >= ${quantity}`,
        ),
      )
      .returning({
        id: productVariants.id,
      });

    if (!updatedVariant) {
      throw new BadRequestException(
        `Insufficient available stock for variant ${variantId}`,
      );
    }

    return updatedVariant;
  }

  // Create a reservation and reserve stock for all order items.
  async reserveForOrder(
    tx: DbTransaction,
    orderId: number,
    items: {
      variantId: number;
      quantity: number;
    }[],
  ) {
    if (items.length === 0) {
      throw new BadRequestException(
        'Cannot create a reservation without items',
      );
    }

    // Combine duplicate variants.
    const itemMap = new Map<number, number>();

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new BadRequestException('Invalid reservation quantity');
      }

      itemMap.set(
        item.variantId,
        (itemMap.get(item.variantId) ?? 0) + item.quantity,
      );
    }

    // Convert the map to an array and sort by variant ID.
    const reservationItems = Array.from(
      itemMap,
      ([variantId, quantity]) => ({
        variantId,
        quantity,
      }),
    ).sort((a, b) => a.variantId - b.variantId);

    // Set reservation expiry to 10 minutes from now.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create the main reservation record.
    const [reservation] = await tx
      .insert(stockReservations)
      .values({
        orderId,
        expiresAt,
      })
      .returning({
        id: stockReservations.id,
        status: stockReservations.status,
        expiresAt: stockReservations.expiresAt,
      });

    // Reserve stock for every variant.
    for (const item of reservationItems) {
      await this.reserveVariantStock(
        tx,
        item.variantId,
        item.quantity,
      );
    }

    // Save the individual reservation items.
    await tx.insert(stockReservationItems).values(
      reservationItems.map((item) => ({
        reservationId: reservation.id,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );

    return {
      ...reservation,
      items: reservationItems,
    };
  }


   // Expire one reservation and release its reserved stock.
   
async expireReservation(
  tx: DbTransaction,
  reservationId: number,
) {
  // 1. Lock the reservation row.
  const [reservation] = await tx
    .select()
    .from(stockReservations)
    .where(eq(stockReservations.id, reservationId))
    .for('update');

  if (!reservation) {
    throw new BadRequestException('Reservation not found');
  }

  // 2. Check reservation status.
  if (reservation.status !== 'ACTIVE') {
    return {
      expired: false,
      message: `Reservation cannot expire because its current status is ${reservation.status}`,
    };
  }

  // 3. Atomically expire only if PostgreSQL considers it expired.
  const [expiredReservation] = await tx
    .update(stockReservations)
    .set({
      status: 'EXPIRED',
      updatedAt: sql`NOW()`,
    })
    .where(
      and(
        eq(stockReservations.id, reservationId),
        eq(stockReservations.status, 'ACTIVE'),
        sql`${stockReservations.expiresAt} <= NOW()`,
      ),
    )
    .returning({
      id: stockReservations.id,
    });

  if (!expiredReservation) {
    return {
      expired: false,
      message: 'Reservation has not expired yet',
    };
  }

  // 4. Retrieve reservation items.
  const items = await tx
    .select({
      variantId: stockReservationItems.variantId,
      quantity: stockReservationItems.quantity,
    })
    .from(stockReservationItems)
    .where(
      eq(stockReservationItems.reservationId, reservationId),
    )
    .orderBy(stockReservationItems.variantId);

  if (items.length === 0) {
    throw new InternalServerErrorException(
      'Reservation has no items to release',
    );
  }

  // 5. Release reserved stock.
  for (const item of items) {
    const [updatedVariant] = await tx
      .update(productVariants)
      .set({
        reservedStock: sql`
          ${productVariants.reservedStock} - ${item.quantity}
        `,
      })
      .where(
        and(
          eq(productVariants.id, item.variantId),
          sql`${productVariants.reservedStock} >= ${item.quantity}`,
        ),
      )
      .returning({
        id: productVariants.id,
      });

    if (!updatedVariant) {
      throw new InternalServerErrorException(
        `Unable to release reserved stock for variant ${item.variantId}`,
      );
    }
  }

  // 6. Return after all items have been released.
  return {
    expired: true,
    reservationId,
    releasedItems: items,
  };
}

}

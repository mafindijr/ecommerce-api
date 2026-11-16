import { BadRequestException, Injectable } from '@nestjs/common';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgTransaction } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';
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
}

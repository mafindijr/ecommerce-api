import { IsIn } from 'class-validator';

export class UpdateOrdersStatusDto {
    @IsIn([
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
    ])
    status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
}
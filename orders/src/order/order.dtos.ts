export class CreateOrderDto {
    id?: string;
    bookId: string;
    customerId: string;
    quantity: number;
    totalPrice: number;
}
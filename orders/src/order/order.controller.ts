import {
    Controller,
    Post,
    Body,
    Inject,
    NotFoundException,
    BadRequestException,
    ServiceUnavailableException,
    Param,
    Delete,
    Response,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './order.dtos';
import axios from 'axios';

const GET_CUSTOMER = 'getCustomer';
const GET_BOOK = 'getBook';
const IS_BOOK_IN_STOCK = 'isBookInStock';
const DECREASE_STOCK = 'DecreaseStock';

@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        @Inject('BOOK_SERVICE') private readonly bookClient: ClientProxy,
        @Inject('CUSTOMER_SERVICE') private readonly customerClient: ClientProxy,
    ) { }

    @Post('/')
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        const { bookId, customerId, quantity } = createOrderDto;

        let customer, book;
        try {
            customer = await this.customerClient
                .send(GET_CUSTOMER, { customerId })
                .toPromise();
            book = await this.bookClient.send(GET_BOOK, { bookId }).toPromise();
        } catch (error) {
            throw new ServiceUnavailableException(
                'Service unavailable, please try again later',
            );
        }

        if (!customer) throw new NotFoundException('Customer not found');
        if (!book) throw new NotFoundException('Book not found');

        const isBookInStock = await this.bookClient
            .send(IS_BOOK_IN_STOCK, { bookId, quantity })
            .toPromise();
        if (!isBookInStock)
            throw new BadRequestException('Not enough books in stock');

        const order = await this.orderService.createOrder(createOrderDto);
        this.bookClient.emit(DECREASE_STOCK, { bookId, quantity });

        return order;
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.OK)
    async deleteOrder(@Param('id') orderId: string, @Response() res: any) {
        const order = await this.orderService.getOrder(orderId);
        const { bookId, quantity } = order;
        // Delete the order
        await this.orderService.deleteOrder(orderId);
        try {

            // Http request to book service add back the book in stock
            await axios.patch(`http://localhost:3002/book/${bookId}`, {
                quantity,
            });

            // Return success response if stock update was successful
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Order deleted successfully and stock updated',
            });
        } catch (error) {
            console.error('Error updating book stock:', error.message);

            // Rollback: Re-create the deleted order if stock update fails
            await this.orderService.createOrder(order);

            throw new InternalServerErrorException(
                'Failed to update stock, order rollback performed',
            );
        }
    }
}
import {
    Controller,
    Get,
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
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const GET_CUSTOMER = 'getCustomer';
const GET_BOOK = 'getBook';
const IS_BOOK_IN_STOCK = 'isBookInStock';
const DECREASE_STOCK = 'DecreaseStock';

@Controller('order')
export class OrderController {
    constructor(
        private readonly configService: ConfigService,
        private readonly orderService: OrderService,
        @Inject('BOOK_SERVICE') private readonly bookClient: ClientProxy,
        @Inject('CUSTOMER_SERVICE') private readonly customerClient: ClientProxy,
    ) { }

    @Get()
    async findAll() {
        console.log('[lms][order][controller][findAll] - fetching all orders');
        return await this.orderService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        console.log(`[lms][order][controller][findOne] - fetching order with id: ${id}`);
        return await this.orderService.getOrder(id);
    }

    @Post('/')
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        console.log('[lms][order][controller][createOrder] - creating order', createOrderDto);

        const { bookId, customerId, quantity } = createOrderDto;

        console.log('[lms][order][controller][createOrder] - fetching customer from customer service');
        let customer = await this.customerClient
            .send(GET_CUSTOMER, { customerId })
            .toPromise();
        console.log('[lms][order][controller][createOrder] - customer fetched:', customer);

        console.log('[lms][order][controller][createOrder] - fetching book from book service');
        let book = await this.bookClient.send(GET_BOOK, { bookId }).toPromise();
        console.log('[lms][order][controller][createOrder] - book fetched:', book);

        if (!customer) throw new NotFoundException('Customer not found');
        if (!book) throw new NotFoundException('Book not found');

        console.log('[lms][order][controller][createOrder] - checking book stock');
        const isBookInStock = await this.bookClient
            .send(IS_BOOK_IN_STOCK, { bookId, quantity })
            .toPromise();
        console.log('[lms][order][controller][createOrder] - isBookInStock:', isBookInStock);
        if (!isBookInStock)
            throw new BadRequestException('Not enough books in stock');

        console.log('[lms][order][controller][createOrder] - creating order in service');
        const order = await this.orderService.createOrder(createOrderDto);
        console.log('[lms][order][controller][createOrder] - order created:', order);

        this.bookClient.emit(DECREASE_STOCK, { bookId, quantity });
        console.log('[lms][order][controller][createOrder] - decrease stock event emitted');

        return order;
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.OK)
    async deleteOrder(@Param('id') orderId: string, @Response() res: any) {
        console.log(`[lms][order][controller][deleteOrder] - deleting order with id: ${orderId}`);
        const order = await this.orderService.getOrder(orderId);
        const { bookId, quantity } = order;
        await this.orderService.deleteOrder(orderId);
        try {
            const orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL') ?? 'http://localhost:3002';
            console.log('[lms][order][controller][deleteOrder] - increasing book stock via book service');
            await axios.patch(`${orderServiceUrl}/book/${bookId}`, {
                quantity,
            });
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Order deleted successfully and stock updated',
            });
        } catch (error) {
            console.error('[lms][order][controller][deleteOrder] - error updating book stock:', error.message);
            await this.orderService.createOrder(order);
            throw new InternalServerErrorException(
                'Failed to update stock, order rollback performed',
            );
        }
    }
}
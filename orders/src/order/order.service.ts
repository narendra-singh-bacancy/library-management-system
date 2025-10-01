import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { Order } from './order.entity';
import { CreateOrderDto } from './order.dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async findAll(): Promise<Order[]> {
        console.log('[lms][order][service][findAll] - fetching all orders from repository');
        return await this.orderRepository.find();
    }

    async createOrder(createOrderDto: CreateOrderDto) {
        console.log('[lms][order][service][createOrder] - creating order in repository', createOrderDto);
        const { bookId, customerId, quantity, totalPrice } = createOrderDto;

        const order = createOrderDto.id
            ? this.orderRepository.create({
                id: createOrderDto.id,
                bookId,
                customerId,
                quantity,
                totalPrice,
            })
            : this.orderRepository.create({
                bookId,
                customerId,
                quantity,
                totalPrice,
            });

        await this.orderRepository.save(order);
        console.log('[lms][order][service][createOrder] - order saved:', order);
        return order;
    }

    async getOrder(orderId: string): Promise<Order> {
        console.log(`[lms][order][service][getOrder] - fetching order with id: ${orderId}`);
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
        });
        if (!order) {
            console.error(`[lms][order][service][getOrder] - order not found with id: ${orderId}`);
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    async deleteOrder(
        orderId: string,
    ): Promise<{ statusCode: HttpStatus; message: string }> {
        console.log(`[lms][order][service][deleteOrder] - deleting order with id: ${orderId}`);
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
        });

        if (!order) {
            console.error(`[lms][order][service][deleteOrder] - order not found with id: ${orderId}`);
            throw new NotFoundException('Order not found');
        }

        await this.orderRepository.delete(orderId);
        console.log(`[lms][order][service][deleteOrder] - order deleted with id: ${orderId}`);
        return {
            statusCode: HttpStatus.OK,
            message: 'Order deleted successfully',
        };
    }
}
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '../rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), RabbitMQModule],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}

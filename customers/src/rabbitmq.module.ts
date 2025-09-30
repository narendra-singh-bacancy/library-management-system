import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'BOOK_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') ?? ''],
                        queue: 'book_queue',
                        queueOptions: { durable: false },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'CUSTOMER_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') ?? ''],
                        queue: 'customer_queue',
                        queueOptions: { durable: false },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'ORDER_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') ?? ''],
                        queue: 'order_queue',
                        queueOptions: { durable: false },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class RabbitMQModule { }
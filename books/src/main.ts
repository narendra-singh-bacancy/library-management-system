import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3002;
  const RABBITMQ_URL = configService.get<string>('RABBITMQ_URL') ?? '';
  const RABBITMQ_QUEUE = configService.get<string>('RABBITMQ_QUEUE') ?? '';

  app.enableCors();
  await app.listen(PORT);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: RABBITMQ_QUEUE,
      queueOptions: { durable: false },
    },
  });

  await microservice.listen();
}
bootstrap();
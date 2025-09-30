# Library Management System (Monorepo)

This project is a monolithic library management system built with NestJS, organized as a monorepo with three main services:

- **books/**: Manages book inventory, stock, and book-related operations.
- **customers/**: Handles customer data and operations.
- **orders/**: Manages book orders, including order creation and processing.

## Features
- Microservice communication via RabbitMQ
- PostgreSQL database integration for each service
- Dockerized setup for easy local development and deployment
- Environment variable management via `.env` files
- Organized codebase for scalability and maintainability

## Project Structure
```
books/
  src/
  .env.example
  ...
customers/
  src/
  .env.example
  ...
orders/
  src/
  .env.example
  ...
README.md
.gitignore
Dockerfile
...
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### Setup
1. Copy `.env.example` to `.env` in each service and fill in the required values.
2. Build and start all services using Docker Compose:
   ```sh
   docker compose up --build
   ```
3. Access services via their respective ports (default: customers - 3000, orders - 3001, books - 3002).

### Development
- Each service is a standalone NestJS application.
- Shared configuration and environment variables are managed via `.env` files.
- For local development, you can run each service individually using `npm run start:dev` inside the respective folder.

## Environment Variables
See `.env.example` in each service for required variables:
- `PORT`: Service port
- `RABBITMQ_URL`: RabbitMQ connection string
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PORT`: Database config

## Microservices & Communication
- Services communicate using RabbitMQ for event-driven and request/response patterns.
- Each service registers its own microservice clients in `rabbitmq.module.ts`.

## Database
- Each service uses PostgreSQL via TypeORM.
- Database config is managed via environment variables.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
This project is licensed under the MIT License.

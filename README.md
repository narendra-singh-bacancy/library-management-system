# Library Management System (Monorepo)

This is a scalable, containerized library management system built with NestJS, organized as a monorepo with three microservices:

- **books/**: Manages book inventory, stock, and book-related operations.
- **customers/**: Handles customer data and operations.
- **orders/**: Manages book orders, including order creation and processing.

## 🔧 Features

- Microservice architecture with RabbitMQ for communication
- PostgreSQL database integration per service
- Dockerized setup for development and production
- Environment variable management via `.env` files
- Clean separation of dev and prod workflows
- Multi-stage Docker builds for optimized image sizes

---

## 📁 Project Structure

```
library-management-system/
├─ books/
│  ├─ src/
│  ├─ .env.example
│  ├─ Dockerfile.base
│  ├─ Dockerfile.dev
│  └─ Dockerfile.prod
├─ customers/
│  ├─ src/
│  ├─ .env.example
│  ├─ Dockerfile.base
│  ├─ Dockerfile.dev
│  └─ Dockerfile.prod
├─ orders/
│  ├─ src/
│  ├─ .env.example
│  ├─ Dockerfile.base
│  ├─ Dockerfile.dev
│  └─ Dockerfile.prod
├─ docker-compose.base.yml
├─ docker-compose.dev.yml
├─ docker-compose.prod.yml
└─ README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (for local development without Docker)

### Setup Instructions

1. Copy `.env.example` to `.env` in each service folder and fill in required values.
2. Build and run all services using Docker Compose (see below for dev/prod modes).

---

## 🐳 Docker Usage Guide

### 🔄 File Separation

Each service uses three Dockerfiles:

- `Dockerfile.base`: Shared setup (dependencies, tsconfig, etc.)
- `Dockerfile.dev`: Development mode (live reload, mounted volumes)
- `Dockerfile.prod`: Production mode (compiled code, minimal image)

Docker Compose files:

- `docker-compose.base.yml`: Common services (e.g., PostgreSQL)
- `docker-compose.dev.yml`: Dev overrides (volumes, ports, live reload)
- `docker-compose.prod.yml`: Prod overrides (dist-only, no volumes)

---

### 🧪 Development Mode

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up --build
```

- Live reload enabled (`npm run start:dev`)
- Source code mounted into containers
- Default ports:
  - customers: `3000`
  - orders: `3001`
  - books: `3002`

To stop containers:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down
```

To stop and remove volumes:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down -v
```

---

### 🏭 Production Mode

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up --build -d
```

- Only compiled JS (`dist`) is copied
- No source code mounted
- Smaller, secure images
- Runs in detached mode (`-d`)

To stop containers:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down
```

To stop and remove volumes:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down -v
```

---

### 🧹 Clearing Docker Cache

To force rebuild without cache:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml build --no-cache
```

To prune unused Docker build cache:

```bash
docker builder prune --all
```

---

### 🔀 Unified Command Strategy

You can merge dev/prod commands using environment flags or aliases:

```bash
# DEV
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up --build

# PROD
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up --build -d

# BUILD ONLY (dev or prod)
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml build
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml build

# STOP
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down
```

---

## 🧬 Environment Variables

Each service uses its own `.env` file. Required variables include:

```env
PORT=3000
RABBITMQ_URL=amqp://localhost:5672
POSTGRES_USER=library_user
POSTGRES_PASSWORD=library_pass
POSTGRES_DB=librarydb
POSTGRES_HOST=library-postgres
POSTGRES_PORT=5432
```

---

## 📡 Microservices & RabbitMQ

- Services communicate via RabbitMQ using NestJS microservice clients.
- Each service has its own `rabbitmq.module.ts` for client setup.
- Supports both event-driven and request-response patterns.

---

## 🗄️ Database

- Each service uses PostgreSQL via TypeORM.
- Database connection is configured via `.env` files.
- A shared `library-postgres` container is defined in `docker-compose.base.yml`.

---

## 🧑‍💻 Development Without Docker

You can run services individually:

```bash
cd orders
npm install
npm run start:dev
```

Repeat for `books/` and `customers/`.

---

## 📦 Docker Image Publishing

To build and push images to GitHub Container Registry:

```bash
# Build
docker build -t ghcr.io/USERNAME/library-management-system-customer:latest -f ./customers/Dockerfile.prod ./customers
docker build -t ghcr.io/USERNAME/library-management-system-order:latest -f ./orders/Dockerfile.prod ./orders
docker build -t ghcr.io/USERNAME/library-management-system-book:latest -f ./books/Dockerfile.prod ./books

# Push
docker push ghcr.io/USERNAME/library-management-system-customer:latest
docker push ghcr.io/USERNAME/library-management-system-order:latest
docker push ghcr.io/USERNAME/library-management-system-book:latest
```

> Replace `USERNAME` with your GitHub username.
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

## 🚀 Kubernetes Deployment Guide

This project uses Kubernetes to deploy three microservices (`orders`, `books`, `customers`) along with a shared PostgreSQL database and cloud-based RabbitMQ. All container images are hosted on GitHub Container Registry (GHCR).

---

### 📦 Prerequisites

- Docker Desktop with Kubernetes enabled (or any local/cloud Kubernetes cluster)
- `kubectl` CLI installed
- GHCR access token configured as a Kubernetes secret

---

### 🔐 Step 1: Create GHCR Pull Secret

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-ghcr-username> \
  --docker-password=<your-ghcr-token> \
  --docker-email=<your-email>
```

---

### 🗄️ Step 2: Deploy Shared PostgreSQL with Persistent Storage

```bash
kubectl apply -f infra/k8s/postgres-pvc.yaml
kubectl apply -f infra/k8s/postgres-deployment.yaml
kubectl apply -f infra/k8s/postgres-service.yaml
```

> This creates a persistent volume and exposes PostgreSQL as `library-postgres:5432`.

---

### 📚 Step 3: Deploy Microservices

Each service has its own `k8s` folder with `configmap.yaml`, `deployment.yaml`, and `service.yaml`.

#### 🟢 Orders Service

```bash
kubectl apply -f orders/k8s/configmap.yaml
kubectl apply -f orders/k8s/deployment.yaml
kubectl apply -f orders/k8s/service.yaml
```

#### 📘 Books Service

```bash
kubectl apply -f books/k8s/configmap.yaml
kubectl apply -f books/k8s/deployment.yaml
kubectl apply -f books/k8s/service.yaml
```

#### 👥 Customers Service

```bash
kubectl apply -f customers/k8s/configmap.yaml
kubectl apply -f customers/k8s/deployment.yaml
kubectl apply -f customers/k8s/service.yaml
```

---

### 🌐 Step 4: Access Services via NodePort

| Service   | NodePort | URL for Postman |
|-----------|----------|-----------------|
| Customers | 30001    | http://localhost:30001 |
| Orders    | 30011    | http://localhost:30011 |
| Books     | 30021    | http://localhost:30021 |

> You can test endpoints using Postman or curl.

---

### 🔁 Step 5: Restart or Reapply Services

#### Reapply all manifests (without deleting):

```bash
kubectl apply -f orders/k8s/
kubectl apply -f books/k8s/
kubectl apply -f customers/k8s/
```

#### Delete and reapply (clean restart):

```bash
kubectl delete -f orders/k8s/
kubectl delete -f books/k8s/
kubectl delete -f customers/k8s/

kubectl apply -f orders/k8s/
kubectl apply -f books/k8s/
kubectl apply -f customers/k8s/
```

#### Restart pods only:

```bash
kubectl delete pod -l app=orders
kubectl delete pod -l app=books
kubectl delete pod -l app=customers
```

---

### 🔍 Step 6: Debugging and Logs

```bash
kubectl get pods
kubectl get services
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

---

### 🧠 Notes

- All services use the same PostgreSQL instance (`library-postgres`)
- RabbitMQ is cloud-hosted via CloudAMQP and accessed via env vars
- Internal service URLs use Kubernetes DNS:
  - http://book-service:3002
  - http://customer-service:3000
  - http://order-service:3001

---

### 📂 Folder Structure

```
infra/k8s/
  ├── postgres-pvc.yaml
  ├── postgres-deployment.yaml
  └── postgres-service.yaml

orders/k8s/
books/k8s/
customers/k8s/
  ├── configmap.yaml
  ├── deployment.yaml
  └── service.yaml
```

---

### 🛑 Step 7: Stop All Kubernetes Resources

To cleanly stop all services, deployments, and volumes (except Kubernetes itself), run:

#### 🧹 Delete Microservices

```bash
kubectl delete -f orders/k8s/
kubectl delete -f books/k8s/
kubectl delete -f customers/k8s/
```

#### 🧹 Delete Shared PostgreSQL

```bash
kubectl delete -f infra/k8s/postgres-deployment.yaml
kubectl delete -f infra/k8s/postgres-service.yaml
kubectl delete -f infra/k8s/postgres-pvc.yaml
```

> ✅ This removes the PostgreSQL pod, service, and persistent volume claim.

---

### 🧼 Optional: Delete GHCR Secret

If you want to remove the image pull secret:

```bash
kubectl delete secret ghcr-secret
```

---

### 🔄 Reset Kubernetes (Optional)

To reset your entire Kubernetes cluster (e.g., in Docker Desktop):

- Go to Docker Desktop → Settings → Kubernetes → Reset Kubernetes Cluster
- Or use Minikube:
  ```bash
  minikube delete
  ```

---

> 🧠 Tip: You can always reapply everything using the deployment steps above to restart your app from scratch.


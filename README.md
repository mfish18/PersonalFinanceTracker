# Fintrack

> Work in progress

A personal finance tracker built with Vue 3, Go, and PostgreSQL.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + TypeScript  |
| Backend | Go |
| Database | PostgreSQL |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Kubernetes + ArgoCD |

## Project Status

| Feature | Status |
|---------|--------|
| Frontend shell | Done |
| Go REST API | Done |
| PostgreSQL integration | Done |
| Auth (JWT) | Done |
| Docker + Compose | Done |
| CI/CD pipeline | Pending |
| Kubernetes + ArgoCD | Pending |

## Getting Started

### Run with Docker (recommended)

Make sure you have Docker and Docker Compose installed.

1. Clone the repo
2. Create a `.env` file in the project root:
```env
DB_USER=dbuser
DB_PASSWORD=db123
DB_NAME=dbname
JWT_SECRET=jwtsecret
```
3. Run:
```bash
docker compose up --build
```
App runs at `http://localhost:3000`.

### Local Development

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

**Backend**
```bash
cd backend
go run main.go
```
Runs at `http://localhost:8080`.

Requires a running PostgreSQL instance.

## Project Structure

```
PersonalFinanceTracker/
├── frontend/          #vue 3 app
│   ├── src/
│   │   ├── api/       #axios instance
│   │   ├── components/
│   │   ├── stores/    #pinia stores
│   │   ├── types/     #typeScript interfaces
│   │   └── views/     #page components
│   ├── Dockerfile
│   └── nginx.conf
├── backend/           #Go REST API
│   ├── config/        #db connection
│   ├── handlers/      #route handlers
│   ├── middleware/    #jwt auth
│   ├── models/        #GORM models
│   ├── router/        #route definitions
│   └── Dockerfile
├── db/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |
# Fintrack

A full-stack personal finance tracker built with Vue 3, Go, PostgreSQL, Docker, Kubernetes, and ArgoCD.

> **Note:** This project is intended as a portfolio/learning project. Secrets and credentials are managed via `.env` files locally and Kubernetes secrets in the cluster — never committed to the repository.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + TypeScript  |
| Backend | Go |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes (Minikube) |
| CI/CD | GitHub Actions + GHCR |
| Deployment | Kubernetes + ArgoCD |

## Project Status
 
| Feature | Status |
|---------|--------|
| Frontend shell + routing | Done |
| Transactions (CRUD) | Done |
| Categories (CRUD) | Done |
| Dashboard (charts) | Done |
| Reports + CSV export | Done |
| Budget tracking | Done |
| Settings (profile, preferences, theme) | Done |
| Go REST API | Done |
| PostgreSQL integration | Done |
| Auth (JWT) | Done |
| Docker + Compose | Done |
| Kubernetes manifests | Done |
| ArgoCD GitOps | Done |
| CI/CD pipeline | Done |

## Features
 
- **Transactions** — add, edit, and delete income and expense transactions with categories and dates
- **Dashboard** — summary cards, spending by category (doughnut chart), and income vs expenses by month (bar chart)
- **Budget tracking** — set monthly budgets per category with progress bars and over-budget alerts
- **Reports** — filter by month and type, daily spending trend (line chart), category breakdown, and CSV export
- **Categories** — manage custom categories with colors for income, expense, or both
- **Settings** — update profile, currency (via Intl API), date format, and light/dark/system theme
- **Auth** — JWT-based registration and login with bcrypt password hashing and password strength validation

## Getting Started

### Option 1 — Docker Compose (recommended for local dev)
 
**Prerequisites:** Docker Desktop
 
1. Clone the repo:
```bash
git clone https://github.com/YOUR_USERNAME/PersonalFinanceTracker.git
cd PersonalFinanceTracker
```
 
2. Create a `.env` file in the project root:
```env
DB_USER=fintrack_user
DB_PASSWORD=your_secure_password
DB_NAME=finance_db
JWT_SECRET=your_jwt_secret
```
 
3. Create `backend/.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=fintrack_user
DB_PASSWORD=your_secure_password
DB_NAME=finance_db
JWT_SECRET=your_jwt_secret
PORT=8080
```
 
4. Start everything:
```bash
docker compose up --build
```
 
5. Open `http://localhost:3000`

### Option 2 — Full GitOps with ArgoCD
 
**Prerequisites:** Minikube running, kubectl, ArgoCD installed on cluster
 
1. Install ArgoCD:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
 
2. Get the admin password:
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
```
Decode the base64 output to get the password.
 
3. Access the ArgoCD UI:
```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443
```
Open `https://localhost:8081` and login with `admin` and the decoded password.
 
4. Apply the ArgoCD application:
```bash
kubectl apply -f k8s/argocd/application.yaml
```
 
ArgoCD will automatically sync the cluster to match the `k8s/` manifests in this repository. Any push to `main` triggers the CI/CD pipeline which builds new images, updates the manifests, and ArgoCD auto-deploys.

### Option 3 — Local Development (frontend + backend separately)
 
**Prerequisites:** Node.js 22+, Go 1.26+, PostgreSQL
 
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`
 
**Backend:**
```bash
cd backend
go run main.go
```
Runs at `http://localhost:8080`
 
Make sure your `backend/.env` is configured and a PostgreSQL instance is running.

### Option 4 — Kubernetes with Minikube
 
**Prerequisites:** Docker Desktop, Minikube, kubectl
 
1. Start Minikube:
```bash
minikube start --driver=docker --cpus=2 --memory=4096
```
 
2. Create the namespace and secrets:
```bash
kubectl create namespace fintrack
 
kubectl create secret generic fintrack-secrets \
  --namespace fintrack \
  --from-literal=DB_USER=fintrack_user \
  "--from-literal=DB_PASSWORD=your_secure_password" \
  "--from-literal=DB_NAME=finance_db" \
  "--from-literal=JWT_SECRET=your_jwt_secret"
```
 
3. Build images into Minikube:
```bash
minikube image build -t fintrack-backend:latest ./backend
minikube image build -t fintrack-frontend:latest ./frontend
```
 
4. Apply manifests:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
```
 
5. Access the app:
```bash
minikube service frontend -n fintrack
```

## CI/CD Pipeline
 
On every push to `main`:
 
1. Backend Go tests run
2. Frontend type check and unit tests run
3. Docker images are built and pushed to GitHub Container Registry (GHCR)
4. Images are tagged with both `latest` and the git short SHA
5. Kubernetes manifests are updated with the new image tags
6. The updated manifests are committed back to the repo
7. ArgoCD detects the change and auto-deploys to the cluster

## Environment Variables
 
### Root `.env` (Docker Compose)
| Variable | Description |
|----------|-------------|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |
 
### `backend/.env` (local dev only)
| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database host (127.0.0.1 for local) |
| `DB_PORT` | Database port (5433 if Docker, 5432 if native) |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Backend server port (default 8080) |
 
> Never commit `.env` files. They are listed in `.gitignore`.
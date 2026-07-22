# Nexus ERP CRM

Mini ERP + CRM Operations Portal for wholesale/distribution companies.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Node.js, Express, TypeScript, Prisma    |
| Database | PostgreSQL (Docker)                     |
| Auth     | JWT (7-day expiry)                      |
| Frontend | React, Vite, TypeScript, Material UI    |

## Modules

- **Authentication** — JWT login, 4 roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS
- **Customer CRM** — Add/edit customers, search, follow-up dates, notes
- **Products & Inventory** — Product CRUD, stock movements (IN/OUT), low-stock alerts
- **Sales Challans** — Multi-product challan creation, auto-number, stock deduction on confirm

## Role Permissions

| Feature          | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|------------------|-------|-------|-----------|----------|
| View all modules | ✅    | ✅    | ✅        | ✅       |
| Manage customers | ✅    | ✅    | ❌        | ❌       |
| Manage products  | ✅    | ❌    | ✅        | ❌       |
| Stock movements  | ✅    | ❌    | ✅        | ❌       |
| Create challans  | ✅    | ✅    | ❌        | ❌       |

## Test Credentials

| Role      | Email                  | Password       |
|-----------|------------------------|----------------|
| Admin     | admin@nexus.com        | admin123       |
| Sales     | sales@nexus.com        | sales123       |
| Warehouse | warehouse@nexus.com    | warehouse123   |
| Accounts  | accounts@nexus.com     | accounts123    |

## Local Setup

### 1. Database

```bash
docker compose up -d
```

### 2. Backend

```bash
cd server
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

## Environment Variables

`server/.env`:
```
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/nexus_erp_crm"
JWT_SECRET="nexus_super_secret_key"
PORT=5000
```

## API Endpoints

| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| POST   | /api/auth/login                 | No   | Login                    |
| POST   | /api/auth/register              | No   | Register user            |
| GET    | /api/auth/me                    | Yes  | Current user             |
| GET    | /api/customers                  | Yes  | List customers           |
| POST   | /api/customers                  | Yes  | Create customer          |
| PUT    | /api/customers/:id              | Yes  | Update customer          |
| GET    | /api/products                   | Yes  | List products            |
| POST   | /api/products                   | Yes  | Create product           |
| PUT    | /api/products/:id               | Yes  | Update product           |
| POST   | /api/products/:id/stock         | Yes  | Add stock movement       |
| GET    | /api/challans                   | Yes  | List challans            |
| POST   | /api/challans                   | Yes  | Create challan           |
| GET    | /api/challans/:id               | Yes  | Challan detail           |
| PATCH  | /api/challans/:id/status        | Yes  | Confirm/Cancel challan   |

## Architecture

```
client/          React SPA (Vite + MUI)
server/
  src/
    controllers/ Business logic per module
    routes/      Express routers
    middleware/  JWT auth + role guard
    utils/       Prisma singleton, JWT helpers
  prisma/
    schema.prisma  Data models
    seed.ts        Test users
```

## Known Limitations

- No invoice PDF export (bonus feature, not implemented)
- No product image upload
- No GitHub Actions CI/CD pipeline
- Challan number generation uses count-based approach (not collision-safe under high concurrency)

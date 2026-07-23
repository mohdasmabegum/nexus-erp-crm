# Nexus ERP CRM

Mini ERP + CRM Operations Portal for wholesale/distribution companies.

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Backend  | Node.js, Express, TypeScript, Prisma ORM    |
| Database | PostgreSQL (Docker / Cloud Postgres)        |
| Auth     | JWT (7-day expiry) with Role-Based Guard    |
| Frontend | React (Vite), TypeScript, Material UI (MUI) |
| PDF      | jsPDF + jsPDF-AutoTable                     |
| DevOps   | Docker, Docker Compose, GitHub Actions CI   |

---

## Features & Modules

- **Authentication & Roles**: JWT login supporting 4 roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **Customer CRM**: Customer management with type classification (Retail/Wholesale/Distributor), status tracking (Lead/Active/Inactive), search, follow-up dates, and notes.
- **Products & Inventory**: Product CRUD, SKU uniqueness, low stock alert badges, location tracking, **Product Image URL (AWS S3/CDN) preview**, and stock movement logs (IN/OUT).
- **Sales Challans**: Multi-product challan creation with automatic pricing, unique auto-generated challan numbers, and stock deduction on confirmation.
- **Invoice PDF Export**: Downloadable PDF Invoices for sales challans with company branding, itemized tables, totals, and signature block.

---

## Role Permissions Matrix

| Feature          | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|------------------|-------|-------|-----------|----------|
| View all modules | ✅    | ✅    | ✅        | ✅       |
| Manage customers | ✅    | ✅    | ❌        | ❌       |
| Manage products  | ✅    | ❌    | ✅        | ❌       |
| Stock movements  | ✅    | ❌    | ✅        | ❌       |
| Create challans  | ✅    | ✅    | ❌        | ❌       |
| Export PDF       | ✅    | ✅    | ✅        | ✅       |

---

## Test Credentials

| Role      | Email                  | Password       |
|-----------|------------------------|----------------|
| Admin     | `admin@nexus.com`      | `admin123`     |
| Sales     | `sales@nexus.com`      | `sales123`     |
| Warehouse | `warehouse@nexus.com`  | `warehouse123` |
| Accounts  | `accounts@nexus.com`   | `accounts123`  |

---

## Local Setup

### Option A: Running with Docker Compose (Recommended)

To run the entire stack (PostgreSQL database, Express backend server, and Nginx frontend client):

```bash
docker compose up --build -d
```
- Client runs at: `http://localhost`
- Server API runs at: `http://localhost:5000`

---

### Option B: Manual Local Setup

#### 1. Start Database
```bash
docker compose up -d postgres
```

#### 2. Start Backend Server
```bash
cd server
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```
Server API will run on `http://localhost:5000`

#### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Client UI will run on `http://localhost:5173`

---

## Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/nexus_erp_crm"
JWT_SECRET="nexus_super_secret_key"
PORT=5000
```

### Frontend (`client/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## API Endpoints

| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| POST   | `/api/auth/login`               | No   | Login                    |
| POST   | `/api/auth/register`            | No   | Register user            |
| GET    | `/api/auth/me`                  | Yes  | Current user details     |
| GET    | `/api/customers`                | Yes  | List/search customers    |
| POST   | `/api/customers`                | Yes  | Create customer          |
| PUT    | `/api/customers/:id`            | Yes  | Update customer          |
| GET    | `/api/products`                 | Yes  | List/search products     |
| POST   | `/api/products`                 | Yes  | Create product (w/ image)|
| PUT    | `/api/products/:id`             | Yes  | Update product (w/ image)|
| POST   | `/api/products/:id/stock`       | Yes  | Record stock movement    |
| GET    | `/api/challans`                 | Yes  | List challans            |
| POST   | `/api/challans`                 | Yes  | Create sales challan     |
| GET    | `/api/challans/:id`             | Yes  | Get challan details      |
| PATCH  | `/api/challans/:id/status`      | Yes  | Confirm/Cancel challan   |

---

## Live Deployment Instructions

### 1. Database (Supabase / Neon / Render Postgres)
1. Create a PostgreSQL database on [Supabase](https://supabase.com), [Neon](https://neon.tech), or Render.
2. Obtain the Connection String URL.

### 2. Backend Deployment (Render / Railway)
1. Connect your GitHub repository to **Render** or **Railway**.
2. Set Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure secret key.
   - `PORT`: `5000` (or platform default).
3. Build Command: `cd server && npm install && npx prisma generate && npm run build`
4. Start Command: `cd server && npm start`

### 3. Frontend Deployment (Vercel / Netlify / Render)
1. Connect your repository to **Vercel** or **Netlify**.
2. Set Root Directory to `client`.
3. Set Environment Variable:
   - `VITE_API_URL`: Your live backend URL (e.g. `https://nexus-erp-api.onrender.com/api`).
4. Build Command: `npm run build`
5. Output Directory: `dist`

---

## Continuous Integration (CI/CD)

Continuous integration is automated via **GitHub Actions** (`.github/workflows/ci.yml`). On every push to `main`, the pipeline automatically runs type checks and verifies production compilation for both server and client modules.

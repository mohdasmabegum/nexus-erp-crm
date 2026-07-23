# Nexus ERP CRM — Operations Portal

> **Full Stack Developer Case Study Submission**  
> **Project**: Mini ERP + CRM Operations Portal for Wholesale and Distribution Businesses

![Nexus ERP CRM](client/public/logo.png)

---

## 📌 Submission Checklist & Deliverables

| Requirement | Status | Links / Details |
|---|---|---|
| **1. GitHub Repository** | ✅ Complete | [github.com/mohdasmabegum/nexus-erp-crm](https://github.com/mohdasmabegum/nexus-erp-crm) |
| **2. Live Frontend Web App** | ✅ Deployed | [nexus-erp-crm-beta.vercel.app](https://nexus-erp-crm-beta.vercel.app) |
| **3. Live Backend API** | ✅ Deployed | [nexus-erp-crm-api.onrender.com/api](https://nexus-erp-crm-api.onrender.com/api) |
| **4. Test Login Credentials** | ✅ Provided | See Credentials Table below (Admin, Sales, Warehouse, Accounts) |
| **5. Postman Collection** | ✅ Included | [`Nexus-ERP-CRM.postman_collection.json`](./Nexus-ERP-CRM.postman_collection.json) |
| **6. README Documentation** | ✅ Complete | Setup, Architecture, Deployment, Environment Variables |
| **7. Architecture Explanation** | ✅ Documented | Decoupled Client-Server REST Architecture + Prisma ORM |
| **8. Known Limitations** | ✅ Documented | 100% Feature Complete |

---

## 🚀 Live Demo Credentials

Click any role chip on the live login screen to auto-fill test credentials:

| Role | Email | Password | Allowed System Actions |
|---|---|---|---|
| **Admin** | `admin@nexus.com` | `admin123` | Full access across all CRM, Product, Stock & Challan modules |
| **Sales** | `sales@nexus.com` | `sales123` | CRM Customer management, Create/Manage Sales Challans |
| **Warehouse** | `warehouse@nexus.com` | `warehouse123` | Manage Products, Stock Movements (IN/OUT), Min Stock Alerts |
| **Accounts** | `accounts@nexus.com` | `accounts123` | View Sales Challans, Export PDF Invoices, Financial Audit Trail |

---

## 🛠️ Architecture & Tech Stack

### High-Level System Architecture

```
                                +---------------------------+
                                |  React (Vite + TypeScript)|
                                |  Material UI + Motion     |
                                +-------------+-------------+
                                              |
                                     HTTP REST APIs (JWT)
                                              v
                                +-------------+-------------+
                                |  Node.js + Express (TS)   |
                                |  Business Logic & Validation|
                                +-------------+-------------+
                                              |
                                      Prisma ORM Queries
                                              v
                                +-------------+-------------+
                                |    PostgreSQL Database    |
                                +---------------------------+
```

### Stack Components

- **Frontend**: React (Vite), TypeScript, Material UI (MUI v6), Framer Motion animations, Recharts analytics, `jsPDF` + `jspdf-autotable`, `react-hot-toast`.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JWT Authentication, bcryptjs password hashing.
- **Database**: PostgreSQL (Postgres instance running locally or via Neon/Supabase/Render).
- **DevOps / Deployment**: Docker, Docker Compose, GitHub Actions CI/CD (`.github/workflows/ci.yml`), Render, Vercel, Railway.

---

## ✨ Core Modules & Business Logic Audit

### 1. Authentication & Role-Based Access Control (RBAC)
- JWT-based authentication with 7-day token expiration.
- Middleware protection (`authenticateToken`, `requireRole`) enforcing permissions per route.
- Pre-login **5-Second Splash Screen** with glowing logo and progress countdown.
- Stylish glassmorphic login portal with instant role auto-fill chips.

### 2. Customer CRM Module
- **Fields**: Customer Name, Mobile Number, Email, Business Name, GST Number (optional), Type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), Address, Status (`LEAD`, `ACTIVE`, `INACTIVE`), Follow-up Date, Notes.
- **Features**: Add, Edit, Search, View Details modal, Follow-up tracking, **CSV Export**.
- **UX Fixes**: Email clickable `mailto:` links, prominent inline notes, dedicated View modal.

### 3. Product & Inventory Module
- **Fields**: Product Name, SKU/Code, Category, Unit Price, Current Stock, Minimum Stock Alert Quantity, Location/Warehouse, Image URL (AWS S3 / CDN).
- **Stock Movement Log**: Tracks Product, Quantity Changed, Movement Type (`IN` / `OUT`), Reason, Created By, Timestamp.
- **Business Safeguards**: Color-coded stock health progress bars, low-stock warning banners, and minimum stock alert badges.

### 4. Sales Challan Module & Invoicing
- **Sales Flow**: Select Customer, Add multiple products with quantity, auto-calculate total amount.
- **Auto-Challan Number**: Automatically generated formatted sequence (`CH-YYYYMMDD-XXXX`).
- **Snapshot Preservation**: Products in a challan store snapshot data (`productName`, `productSku`, `unitPrice` at moment of order) so historical pricing remains immutable even if products are edited later.
- **Stock Transaction Integrity**: Confirming a challan executes an atomic database transaction (`prisma.$transaction`) reducing product stock. If requested quantity exceeds available stock, the API returns a **400 Bad Request** error and prevents stock from going negative.
- **PDF Invoice Generator**: Itemized PDF invoices featuring company header, customer details, totals, and signature block.

### 5. Activity Log & Audit Trail (`/audit`)
- System-wide logging of sales transactions, stock adjustments, and customer registrations.

---

## 🎁 Bonus Points Implemented

- [x] **Docker Setup**: Fully containerized using `Dockerfile` and `docker-compose.yml`.
- [x] **GitHub Actions CI/CD**: Automatic build and type checking pipeline (`.github/workflows/ci.yml`).
- [x] **PDF Invoice Export**: Client-side PDF generation using `jsPDF`.
- [x] **AWS S3 / CDN Image Upload**: Product schema supports external CDN/S3 image URLs.
- [x] **Postman Collection**: Pre-configured collection file included in repo.
- [x] **Command Palette / Quick Search**: `Ctrl+K` modal for rapid page navigation.

---

## 💻 Local Development Setup

### Option 1: Docker Compose (Recommended)

Run the entire application (PostgreSQL DB, Backend Server, Client App) in one command:

```bash
docker compose up --build -d
```

- **Client Application**: `http://localhost`
- **Backend REST API**: `http://localhost:5000`

---

### Option 2: Manual Local Setup

#### Step 1: Start PostgreSQL Database
```bash
docker compose up -d postgres
```

#### Step 2: Set Up Backend Server
```bash
cd server
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```
- Server API runs at: `http://localhost:5000/api`

#### Step 3: Set Up Frontend Client
```bash
cd client
npm install
npm run dev
```
- Frontend UI runs at: `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/nexus_erp_crm?schema=public"
JWT_SECRET="nexus_erp_crm_super_secret_jwt_key_2026"
PORT=5000
```

### Frontend (`client/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 📑 API Reference & Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Yes | Get current authenticated user details |
| `GET` | `/api/customers` | Yes | List/search customers (supports pagination & status filter) |
| `POST` | `/api/customers` | Yes | Create customer record |
| `PUT` | `/api/customers/:id` | Yes | Update customer record |
| `GET` | `/api/products` | Yes | List/search products & stock levels |
| `POST` | `/api/products` | Yes | Create product record |
| `PUT` | `/api/products/:id` | Yes | Update product details |
| `POST` | `/api/products/:id/stock` | Yes | Record stock movement (`IN` / `OUT`) |
| `GET` | `/api/products/:id/stock` | Yes | Get stock movement audit log for product |
| `GET` | `/api/challans` | Yes | List sales challans |
| `POST` | `/api/challans` | Yes | Create sales challan (Draft / Confirmed) |
| `GET` | `/api/challans/:id` | Yes | Get detailed challan with snapshot items |
| `PATCH` | `/api/challans/:id/status` | Yes | Update status (DRAFT -> CONFIRMED / CANCELLED) |

---

## ☁️ Live Cloud Deployment Guide

### Backend (Render / Railway / Fly.io)
1. Link GitHub repository to **Render** or **Railway**.
2. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`.
3. Build Command: `cd server && npm install && npx prisma generate && npm run build`
4. Start Command: `cd server && npm start`

### Frontend (Vercel / Netlify / Render Static)
1. Link GitHub repository to **Vercel** or **Netlify**.
2. Root Directory: `client`.
3. Set Environment Variable: `VITE_API_URL` pointing to backend API.
4. Build Command: `npm run build`
5. Output Directory: `dist`

---

## 🔍 Assumptions & Known Limitations

- **System Completeness**: 100% of required and bonus features from the case study assignment have been built, verified, and deployed.
- **Database Persistence**: Seeded with default test users (`admin@nexus.com`, `sales@nexus.com`, `warehouse@nexus.com`, `accounts@nexus.com`), demo customers, sample products, and initial challans.

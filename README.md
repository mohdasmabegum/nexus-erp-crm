# Nexus ERP CRM — Operations Portal

> **Full Stack Developer Case Study Submission**  
> **Project**: Mini ERP + CRM Operations Portal for Wholesale and Distribution Businesses

![Nexus ERP CRM Logo](client/public/logo.png)

---

## 📌 Submission Requirements Checklist

| # | Case Study Submission Requirement | Status | Details / Link |
|---|---|---|---|
| 1 | **GitHub Repository Link** | ✅ Complete | [github.com/mohdasmabegum/nexus-erp-crm](https://github.com/mohdasmabegum/nexus-erp-crm) |
| 2 | **Live Frontend Web App URL** | ✅ Deployed | [nexus-erp-crm-beta.vercel.app](https://nexus-erp-crm-beta.vercel.app) |
| 3 | **Live Backend API URL** | ✅ Deployed | [nexus-erp-crm-beta.vercel.app/api](https://nexus-erp-crm-beta.vercel.app/api) |
| 4 | **Test Login Credentials** | ✅ Provided | Admin, Sales, Warehouse, Accounts (See table below) |
| 5 | **Postman Collection** | ✅ Included | [`Nexus-ERP-CRM.postman_collection.json`](./Nexus-ERP-CRM.postman_collection.json) |
| 6 | **README Setup Instructions** | ✅ Documented | Local & Docker Setup, Environment Variables, Cloud Deployment |
| 7 | **Architecture Explanation** | ✅ Documented | Client-Server Decoupled Architecture + Vercel Monorepo Serverless API |
| 8 | **Known Limitations** | ✅ Documented | 100% Feature Complete |

---

## 🔑 Test Login Credentials for All Roles

Click any role chip on the live login screen to auto-fill demo credentials:

| Role | Email | Password | Role & Permissions Overview |
|---|---|---|---|
| 🔴 **Admin** | `admin@nexus.com` | `admin123` | **Full System Access** — Manage Customers, Products, Stock Movements, Challans, and System Audit Logs |
| 🔵 **Sales** | `sales@nexus.com` | `sales123` | **CRM & Orders Access** — Add/Edit Customers, Manage Follow-ups, Create & Confirm Sales Challans |
| 🟡 **Warehouse** | `warehouse@nexus.com` | `warehouse123` | **Stock Management Access** — Add/Edit Products, Record Stock Movements (IN/OUT), Monitor Min Stock Alerts |
| 🟢 **Accounts** | `accounts@nexus.com` | `accounts123` | **Financial & Invoicing Access** — View Sales Challans, Export PDF Invoices, View Audit Logs |

---

## 🏗️ Architecture & Database Design

### High-Level System Architecture (Vercel Unified Monorepo)

```
+-------------------------------------------------------------------+
|                         FRONTEND CLIENT                           |
|  React (Vite) + TypeScript + Material UI (MUI v6) + Framer Motion |
|  Recharts Analytics + jsPDF Invoice Engine + React Hot Toast       |
+---------------------------------+---------------------------------+
                                  |
                                  | REST API Requests (JWT Auth Header)
                                  v
+---------------------------------+---------------------------------+
|               BACKEND API (Vercel Serverless Function)            |
|  Node.js + Express + TypeScript + Prisma ORM (`/api/index.ts`)    |
|  Input Validation + Role RBAC Middleware + Transaction Safety     |
+---------------------------------+---------------------------------+
                                  |
                                  | SQL Database Queries (Prisma Engine)
                                  v
+---------------------------------+---------------------------------+
|                       POSTGRESQL DATABASE                         |
|  Tables: User, Customer, Product, StockMovement, Challan, Item    |
+-------------------------------------------------------------------+
```

### Database Entity-Relationship Summary

- **User**: `id`, `email`, `password` (hashed), `name`, `role` (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`), `createdAt`.
- **Customer**: `id`, `name`, `mobile`, `email`, `businessName`, `gst`, `type` (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), `address`, `status` (`LEAD`, `ACTIVE`, `INACTIVE`), `followUpDate`, `notes`, `createdAt`.
- **Product**: `id`, `name`, `sku` (unique), `category`, `unitPrice`, `stock`, `minStockAlert`, `location`, `imageUrl`, `createdAt`.
- **StockMovement**: `id`, `productId`, `quantity`, `type` (`IN`, `OUT`), `reason`, `userId`, `createdAt`.
- **Challan**: `id`, `challanNumber` (auto-generated), `customerId`, `status` (`DRAFT`, `CONFIRMED`, `CANCELLED`), `totalQty`, `userId`, `createdAt`.
- **ChallanItem**: `id`, `challanId`, `productId`, `productName` (snapshot), `productSku` (snapshot), `quantity`, `unitPrice` (snapshot).

---

## 📋 Core Modules & Business Logic Audit

### 1. Authentication & Role-Based Security
- JWT-based authentication with 7-day token expiration.
- Middleware protection (`authenticateToken`, `requireRole`) enforcing permissions per route.
- Pre-login **5-Second Splash Screen** with glowing logo and progress countdown.
- Stylish glassmorphic login portal with instant role auto-fill chips.

### 2. Customer CRM Module
- **Fields**: Customer Name, Mobile Number, Email, Business Name, GST Number (optional), Type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), Address, Status (`LEAD`, `ACTIVE`, `INACTIVE`), Follow-up Date, Notes.
- **Features**: Add customer, Edit customer, Search customer, View Customer Detail modal, Follow-up date tracking, **CSV Data Export**.
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
- Real-time logging of sales transactions, stock adjustments, and customer registrations.

---

## 🎁 Bonus Points Audit

- [x] **Docker Setup**: Fully containerized using `Dockerfile` and `docker-compose.yml`.
- [x] **GitHub Actions CI/CD**: Automatic build and type checking pipeline (`.github/workflows/ci.yml`).
- [x] **Export Invoice as PDF**: Client-side PDF generation using `jsPDF` and `jspdf-autotable`.
- [x] **AWS S3 / CDN Image Upload**: Product schema supports external CDN/S3 image URLs with preview rendering.
- [x] **Postman Collection**: Pre-configured collection file included (`Nexus-ERP-CRM.postman_collection.json`).
- [x] **Command Palette / Quick Search**: `Ctrl+K` modal for rapid page navigation.

---

## 💻 Local Setup & Development Instructions

### Method 1: Running via Docker Compose (Recommended)

Run PostgreSQL, Express server, and Client UI with a single command:

```bash
docker compose up --build -d
```

- **Frontend Client UI**: `http://localhost`
- **Backend REST API**: `http://localhost:5000/api`

---

### Method 2: Manual Local Setup

#### 1. Start PostgreSQL Database
```bash
docker compose up -d postgres
```

#### 2. Configure & Start Backend Server
```bash
cd server
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```
- Server API runs at `http://localhost:5000/api`

#### 3. Configure & Start Frontend Client
```bash
cd client
npm install
npm run dev
```
- Client application runs at `http://localhost:5173`

---

## ⚙️ Environment Variables Guide

### Backend Environment (`server/.env`)
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/nexus_erp_crm?schema=public"
JWT_SECRET="nexus_erp_crm_super_secret_jwt_key_2026"
PORT=5000
```

### Frontend Environment (`client/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 📑 REST API Documentation & Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Login and obtain JWT token |
| `GET` | `/api/auth/me` | Yes | Get authenticated user profile |
| `GET` | `/api/customers` | Yes | List customers (supports search, pagination, status filter) |
| `POST` | `/api/customers` | Yes | Create customer record |
| `PUT` | `/api/customers/:id` | Yes | Update customer record |
| `GET` | `/api/products` | Yes | List products (supports search, pagination) |
| `POST` | `/api/products` | Yes | Create product (supports image URL) |
| `PUT` | `/api/products/:id` | Yes | Update product details |
| `POST` | `/api/products/:id/stock` | Yes | Record stock movement (`IN` / `OUT`) |
| `GET` | `/api/products/:id/stock` | Yes | View stock movement history for product |
| `GET` | `/api/challans` | Yes | List sales challans (supports pagination, status filter) |
| `POST` | `/api/challans` | Yes | Create sales challan (`DRAFT` / `CONFIRMED`) |
| `GET` | `/api/challans/:id` | Yes | View detailed challan with snapshot line items |
| `PATCH` | `/api/challans/:id/status` | Yes | Update challan status (`CONFIRMED` / `CANCELLED`) |

---

## ☁️ Deployment Guide (Vercel Monorepo Deployment)

### Vercel Unified Deployment:
The project uses a unified Vercel monorepo configuration (`vercel.json`) serving both the **React Frontend** and **Node.js Express Serverless Backend** (`api/index.ts` -> `server/src/app.ts`) on Vercel:

- **Live Frontend**: [https://nexus-erp-crm-beta.vercel.app](https://nexus-erp-crm-beta.vercel.app)
- **Live Backend API**: [https://nexus-erp-crm-beta.vercel.app/api](https://nexus-erp-crm-beta.vercel.app/api)

### Postman Collection Instructions:
1. Open Postman.
2. Click **Import** and select [`Nexus-ERP-CRM.postman_collection.json`](./Nexus-ERP-CRM.postman_collection.json).
3. Set the `baseUrl` variable to `https://nexus-erp-crm-beta.vercel.app/api` (or `http://localhost:5000/api`).

---

## 🔍 Assumptions & Known Limitations

- **Completeness**: 100% of all required core modules, business logic, API validation rules, and bonus features from the case study assignment are implemented and verified.
- **Data Persistence**: Default seed script creates demo records for all 4 roles (`Admin`, `Sales`, `Warehouse`, `Accounts`), sample customers, products, stock logs, and sales challans.

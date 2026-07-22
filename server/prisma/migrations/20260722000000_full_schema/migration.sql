-- Drop old Role enum and User table to recreate cleanly
DROP TABLE IF EXISTS "User" CASCADE;
DROP TYPE IF EXISTS "Role";

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS');
CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR');
CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE');
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT');
CREATE TYPE "ChallanStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Customer
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "businessName" TEXT,
    "gst" TEXT,
    "type" "CustomerType" NOT NULL DEFAULT 'RETAIL',
    "address" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStockAlert" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- StockMovement
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "MovementType" NOT NULL,
    "reason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- Challan
CREATE TABLE "Challan" (
    "id" TEXT NOT NULL,
    "challanNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "status" "ChallanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Challan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Challan_challanNumber_key" ON "Challan"("challanNumber");

-- ChallanItem
CREATE TABLE "ChallanItem" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "ChallanItem_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChallanItem" ADD CONSTRAINT "ChallanItem_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "Challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

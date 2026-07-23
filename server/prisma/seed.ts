import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────
  const userDefs = [
    { name: "Admin User",     email: "admin@nexuserp.com",     password: "Admin@123",     role: "ADMIN"     as Role },
    { name: "Sales User",     email: "sales@nexuserp.com",     password: "Sales@123",     role: "SALES"     as Role },
    { name: "Warehouse User", email: "warehouse@nexuserp.com", password: "Warehouse@123", role: "WAREHOUSE" as Role },
    { name: "Accounts User",  email: "accounts@nexuserp.com",  password: "Accounts@123",  role: "ACCOUNTS"  as Role },
  ];

  const createdUsers: Record<string, string> = {};
  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: await bcrypt.hash(u.password, 10) },
    });
    createdUsers[u.role] = user.id;
    console.log(`Seeded user: ${u.email}`);
  }

  // ── Customers ──────────────────────────────────────────────────────────────
  const customerDefs = [
    { name: "Rahul Sharma",        businessName: "Sharma Traders",      mobile: "9876543210", email: "rahul@sharmatraders.com", type: "WHOLESALE"   as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29ABCDE1234F1Z5", followUpDate: new Date("2026-07-25"), notes: "Interested in bulk laptop purchase." },
    { name: "Priya Enterprises",   businessName: "Priya Enterprises",   mobile: "9876543211", email: "contact@priya.com",        type: "DISTRIBUTOR" as CustomerType, status: "LEAD"     as CustomerStatus, gst: "29PQRSX5678L1Z2", followUpDate: new Date("2026-07-26"), notes: "Requested quotation for printers." },
    { name: "Green Mart",          businessName: "Green Mart",          mobile: "9876543212", email: "info@greenmart.com",       type: "RETAIL"      as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29JKLMN4567A1Z8", followUpDate: new Date("2026-07-27"), notes: "Follow-up after product demo." },
    { name: "Royal Distributors",  businessName: "Royal Distributors",  mobile: "9876543213", email: "sales@royaldist.com",      type: "DISTRIBUTOR" as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29ABCDE8765G1Z4", followUpDate: new Date("2026-07-29"), notes: "Negotiating annual supply contract." },
    { name: "Sai Super Market",    businessName: "Sai Super Market",    mobile: "9876543214", email: "sai@market.com",           type: "RETAIL"      as CustomerType, status: "INACTIVE" as CustomerStatus, gst: null },
    { name: "Metro Stores",        businessName: "Metro Stores",        mobile: "9876543215", email: "metro@stores.com",         type: "WHOLESALE"   as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29XYZAB3456D1Z7" },
    { name: "Fresh Choice",        businessName: "Fresh Choice",        mobile: "9876543216", email: "fresh@choice.com",         type: "RETAIL"      as CustomerType, status: "LEAD"     as CustomerStatus, gst: null },
    { name: "Om Agencies",         businessName: "Om Agencies",         mobile: "9876543217", email: "om@agencies.com",          type: "DISTRIBUTOR" as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29LMNOP9876K1Z1" },
    { name: "Universal Foods",     businessName: "Universal Foods",     mobile: "9876543218", email: "universal@foods.com",      type: "WHOLESALE"   as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29QQQQQ1234A1Z3" },
    { name: "Smart Retail",        businessName: "Smart Retail",        mobile: "9876543219", email: "smart@retail.com",         type: "RETAIL"      as CustomerType, status: "LEAD"     as CustomerStatus, gst: null, followUpDate: new Date("2026-07-30"), notes: "Waiting for management approval." },
    { name: "Sunrise Traders",     businessName: "Sunrise Traders",     mobile: "9876543220", email: "sunrise@trade.com",        type: "WHOLESALE"   as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29AAAAA1111A1Z9" },
    { name: "Nova Supplies",       businessName: "Nova Supplies",       mobile: "9876543221", email: "nova@supplies.com",        type: "DISTRIBUTOR" as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29BBBBB2222B1Z8" },
    { name: "Elite Wholesale",     businessName: "Elite Wholesale",     mobile: "9876543222", email: "elite@wholesale.com",      type: "WHOLESALE"   as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: "29CCCCC3333C1Z7" },
    { name: "Bright Retail",       businessName: "Bright Retail",       mobile: "9876543223", email: "bright@retail.com",        type: "RETAIL"      as CustomerType, status: "ACTIVE"   as CustomerStatus, gst: null },
    { name: "Vision Distributors", businessName: "Vision Distributors", mobile: "9876543224", email: "vision@dist.com",          type: "DISTRIBUTOR" as CustomerType, status: "LEAD"     as CustomerStatus, gst: "29DDDDD4444D1Z6" },
  ];

  const createdCustomers: Record<string, string> = {};
  for (const c of customerDefs) {
    const existing = await prisma.customer.findFirst({ where: { mobile: c.mobile } });
    const customer = existing
      ? existing
      : await prisma.customer.create({ data: c as any });
    createdCustomers[c.name] = customer.id;
    console.log(`Seeded customer: ${c.name}`);
  }

  // ── Products ───────────────────────────────────────────────────────────────
  const productDefs = [
    { sku: "NX1001", name: "Dell Laptop",          category: "Electronics", unitPrice: 65000, stock: 30, minStockAlert: 5,  location: "Hyderabad Central Warehouse" },
    { sku: "NX1002", name: "HP Laptop",            category: "Electronics", unitPrice: 62000, stock: 22, minStockAlert: 5,  location: "Hyderabad Central Warehouse" },
    { sku: "NX1003", name: "Logitech Mouse",       category: "Accessories", unitPrice: 650,   stock: 120, minStockAlert: 20, location: "Hyderabad Central Warehouse" },
    { sku: "NX1004", name: "Mechanical Keyboard",  category: "Accessories", unitPrice: 2200,  stock: 80, minStockAlert: 15, location: "Hyderabad Central Warehouse" },
    { sku: "NX1005", name: "Samsung SSD 1TB",      category: "Storage",     unitPrice: 7200,  stock: 50, minStockAlert: 10, location: "Hyderabad Central Warehouse" },
    { sku: "NX1006", name: "WD HDD 2TB",           category: "Storage",     unitPrice: 5400,  stock: 40, minStockAlert: 10, location: "Hyderabad Central Warehouse" },
    { sku: "NX1007", name: "Dell Monitor 24\"",    category: "Monitors",    unitPrice: 9800,  stock: 35, minStockAlert: 5,  location: "Bangalore Distribution Center" },
    { sku: "NX1008", name: "Lenovo Monitor",       category: "Monitors",    unitPrice: 9100,  stock: 25, minStockAlert: 5,  location: "Bangalore Distribution Center" },
    { sku: "NX1009", name: "USB Hub",              category: "Accessories", unitPrice: 850,   stock: 150, minStockAlert: 20, location: "Bangalore Distribution Center" },
    { sku: "NX1010", name: "Webcam HD",            category: "Accessories", unitPrice: 1800,  stock: 70, minStockAlert: 10, location: "Bangalore Distribution Center" },
    { sku: "NX1011", name: "Office Chair",         category: "Furniture",   unitPrice: 5200,  stock: 45, minStockAlert: 10, location: "Chennai Storage Hub" },
    { sku: "NX1012", name: "Study Table",          category: "Furniture",   unitPrice: 8500,  stock: 18, minStockAlert: 5,  location: "Chennai Storage Hub" },
    { sku: "NX1013", name: "Printer HP",           category: "Printers",    unitPrice: 12400, stock: 20, minStockAlert: 5,  location: "Chennai Storage Hub" },
    { sku: "NX1014", name: "Epson Printer",        category: "Printers",    unitPrice: 11200, stock: 16, minStockAlert: 5,  location: "Chennai Storage Hub" },
    { sku: "NX1015", name: "Router TP-Link",       category: "Networking",  unitPrice: 2400,  stock: 55, minStockAlert: 10, location: "Hyderabad Central Warehouse" },
    { sku: "NX1016", name: "Switch 8 Port",        category: "Networking",  unitPrice: 3500,  stock: 30, minStockAlert: 8,  location: "Hyderabad Central Warehouse" },
    { sku: "NX1017", name: "HDMI Cable",           category: "Accessories", unitPrice: 450,   stock: 220, minStockAlert: 50, location: "Hyderabad Central Warehouse" },
    { sku: "NX1018", name: "Power Bank",           category: "Electronics", unitPrice: 1800,  stock: 60, minStockAlert: 10, location: "Bangalore Distribution Center" },
    { sku: "NX1019", name: "Bluetooth Speaker",    category: "Electronics", unitPrice: 2500,  stock: 45, minStockAlert: 10, location: "Bangalore Distribution Center" },
    { sku: "NX1020", name: "External SSD",         category: "Storage",     unitPrice: 8900,  stock: 28, minStockAlert: 5,  location: "Hyderabad Central Warehouse" },
  ];

  const createdProducts: Record<string, string> = {};
  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
    createdProducts[p.name] = product.id;
    console.log(`Seeded product: ${p.name}`);
  }

  // ── Stock Movements ────────────────────────────────────────────────────────
  const warehouseId = createdUsers["WAREHOUSE"];
  const salesId     = createdUsers["SALES"];

  const movementDefs = [
    { productName: "Dell Laptop",       quantity: 15,  type: "IN"  as MovementType, reason: "Supplier Delivery", createdBy: warehouseId },
    { productName: "Logitech Mouse",    quantity: 10,  type: "OUT" as MovementType, reason: "Sales Challan",     createdBy: salesId },
    { productName: "Samsung SSD 1TB",   quantity: 20,  type: "IN"  as MovementType, reason: "Purchase Order",    createdBy: warehouseId },
    { productName: "Webcam HD",         quantity: 8,   type: "OUT" as MovementType, reason: "Customer Order",    createdBy: salesId },
    { productName: "Office Chair",      quantity: 10,  type: "IN"  as MovementType, reason: "New Stock",         createdBy: warehouseId },
    { productName: "Router TP-Link",    quantity: 5,   type: "OUT" as MovementType, reason: "Sales",             createdBy: salesId },
    { productName: "HDMI Cable",        quantity: 100, type: "IN"  as MovementType, reason: "Bulk Purchase",     createdBy: warehouseId },
    { productName: "Power Bank",        quantity: 7,   type: "OUT" as MovementType, reason: "Challan",           createdBy: salesId },
  ];

  for (const m of movementDefs) {
    const productId = createdProducts[m.productName];
    if (!productId) continue;
    await prisma.stockMovement.create({
      data: { productId, quantity: m.quantity, type: m.type, reason: m.reason, createdBy: m.createdBy },
    });
    console.log(`Seeded stock movement: ${m.type} ${m.quantity} × ${m.productName}`);
  }

  // ── Challans ───────────────────────────────────────────────────────────────
  const challanDefs = [
    {
      challanNumber: "CH-2026-0001",
      customerName:  "Rahul Sharma",
      status:        "CONFIRMED" as ChallanStatus,
      items: [
        { name: "Dell Laptop",         sku: "NX1001", qty: 2 },
        { name: "Logitech Mouse",      sku: "NX1003", qty: 5 },
        { name: "Mechanical Keyboard", sku: "NX1004", qty: 2 },
      ],
    },
    {
      challanNumber: "CH-2026-0002",
      customerName:  "Green Mart",
      status:        "DRAFT" as ChallanStatus,
      items: [
        { name: "Printer HP",  sku: "NX1013", qty: 1 },
        { name: "HDMI Cable",  sku: "NX1017", qty: 10 },
      ],
    },
    {
      challanNumber: "CH-2026-0003",
      customerName:  "Royal Distributors",
      status:        "CONFIRMED" as ChallanStatus,
      items: [
        { name: "Samsung SSD 1TB", sku: "NX1005", qty: 4 },
        { name: "Router TP-Link",  sku: "NX1015", qty: 2 },
        { name: "Webcam HD",       sku: "NX1010", qty: 3 },
      ],
    },
  ];

  for (const c of challanDefs) {
    const existing = await prisma.challan.findUnique({ where: { challanNumber: c.challanNumber } });
    if (existing) { console.log(`Skipped challan: ${c.challanNumber}`); continue; }

    const customerId = createdCustomers[c.customerName];
    const totalQty   = c.items.reduce((s, i) => s + i.qty, 0);

    const itemsData = c.items.map((i) => ({
      productId:   createdProducts[i.name],
      productName: i.name,
      productSku:  i.sku,
      unitPrice:   productDefs.find((p) => p.sku === i.sku)!.unitPrice,
      quantity:    i.qty,
    }));

    await prisma.challan.create({
      data: {
        challanNumber: c.challanNumber,
        customerId,
        totalQty,
        status:    c.status,
        createdBy: salesId,
        items: { create: itemsData },
      },
    });
    console.log(`Seeded challan: ${c.challanNumber}`);
  }

  console.log("\n✅ All demo data seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

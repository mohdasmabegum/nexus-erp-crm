import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getProducts = async (req: Request, res: Response) => {
  const search: string = (req.query.search as string) ?? "";
  const page: number = parseInt((req.query.page as string) ?? "1");
  const limit: number = parseInt((req.query.limit as string) ?? "20");
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { sku: { contains: search, mode: "insensitive" as const } },
      { category: { contains: search, mode: "insensitive" as const } },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where }),
  ]);

  return res.json({ success: true, data: products, total, page });
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true } } } } },
  });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  return res.json({ success: true, data: product });
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, category, unitPrice, stock, minStockAlert, location } = req.body;
    if (!name || !sku || unitPrice === undefined)
      return res.status(400).json({ success: false, message: "name, sku and unitPrice are required" });
    const product = await prisma.product.create({
      data: { name, sku, category, unitPrice: parseFloat(unitPrice), stock: parseInt(stock ?? 0), minStockAlert: parseInt(minStockAlert ?? 0), location },
    });
    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    if (error.code === "P2002") return res.status(400).json({ success: false, message: "SKU already exists" });
    return res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, category, unitPrice, minStockAlert, location } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, sku, category, unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : undefined, minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert) : undefined, location },
    });
    return res.json({ success: true, data: product });
  } catch {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
};

export const addStockMovement = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { quantity, type, reason } = req.body;
    if (!quantity || !type) return res.status(400).json({ success: false, message: "quantity and type are required" });
    if (!["IN", "OUT"].includes(type)) return res.status(400).json({ success: false, message: "type must be IN or OUT" });

    const qty: number = parseInt(quantity);
    const productId: string = req.params.id;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (type === "OUT" && product.stock < qty)
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${product.stock}` });

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({ data: { productId, quantity: qty, type, reason, createdBy: req.user.id } }),
      prisma.product.update({ where: { id: productId }, data: { stock: { increment: type === "IN" ? qty : -qty } } }),
    ]);

    return res.status(201).json({ success: true, data: movement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to record stock movement" });
  }
};

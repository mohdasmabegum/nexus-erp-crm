import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../utils/prisma";

const generateChallanNumber = async (): Promise<string> => {
  const count = await prisma.challan.count();
  return `CH-${String(count + 1).padStart(5, "0")}`;
};

export const getChallans = async (req: AuthRequest, res: Response) => {
  const { page = "1", limit = "20", status } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = status ? { status } : {};

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, mobile: true } }, user: { select: { name: true } } },
    }),
    prisma.challan.count({ where }),
  ]);

  return res.json({ success: true, data: challans, total, page: parseInt(page) });
};

export const getChallan = async (req: AuthRequest, res: Response) => {
  const challan = await prisma.challan.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: true, user: { select: { name: true } } },
  });
  if (!challan) return res.status(404).json({ success: false, message: "Challan not found" });
  return res.json({ success: true, data: challan });
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, status = "DRAFT" } = req.body;
    if (!customerId || !items?.length)
      return res.status(400).json({ success: false, message: "customerId and items are required" });

    const productIds: string[] = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of items) {
      if (!productMap[item.productId])
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
    }

    // If confirming immediately, check stock
    if (status === "CONFIRMED") {
      for (const item of items) {
        const product = productMap[item.productId];
        if (product.stock < item.quantity)
          return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      }
    }

    const challanNumber = await generateChallanNumber();
    const totalQty = items.reduce((sum: number, i: any) => sum + parseInt(i.quantity), 0);

    const challan = await prisma.$transaction(async (tx) => {
      const created = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQty,
          status,
          createdBy: req.user!.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: productMap[item.productId].name,
              productSku: productMap[item.productId].sku,
              unitPrice: productMap[item.productId].unitPrice,
              quantity: parseInt(item.quantity),
            })),
          },
        },
        include: { items: true, customer: true },
      });

      if (status === "CONFIRMED") {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: parseInt(item.quantity) } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: parseInt(item.quantity),
              type: "OUT",
              reason: `Challan ${challanNumber}`,
              createdBy: req.user!.id,
            },
          });
        }
      }

      return created;
    });

    return res.status(201).json({ success: true, data: challan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create challan" });
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!["CONFIRMED", "CANCELLED"].includes(status))
      return res.status(400).json({ success: false, message: "status must be CONFIRMED or CANCELLED" });

    const challan = await prisma.challan.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!challan) return res.status(404).json({ success: false, message: "Challan not found" });
    if (challan.status !== "DRAFT") return res.status(400).json({ success: false, message: "Only DRAFT challans can be updated" });

    if (status === "CONFIRMED") {
      for (const item of challan.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity)
          return res.status(400).json({ success: false, message: `Insufficient stock for "${item.productName}". Available: ${product?.stock ?? 0}` });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.challan.update({ where: { id: req.params.id }, data: { status } });

      if (status === "CONFIRMED") {
        for (const item of challan.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
          await tx.stockMovement.create({
            data: { productId: item.productId, quantity: item.quantity, type: "OUT", reason: `Challan ${challan.challanNumber}`, createdBy: req.user!.id },
          });
        }
      }

      return result;
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update challan" });
  }
};

import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../utils/prisma";

export const getCustomers = async (req: AuthRequest, res: Response) => {
  const q = req.query as Record<string, string>;
  const search = q.search ?? "";
  const page = parseInt(q.page ?? "1");
  const limit = parseInt(q.limit ?? "20");
  const status = q.status ?? undefined;
  const skip = (page - 1) * limit;

  const where: any = {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { mobile: { contains: search } },
      { businessName: { contains: search, mode: "insensitive" } },
    ],
    ...(status && { status }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  return res.json({ success: true, data: customers, total, page });
};

export const getCustomer = async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  return res.json({ success: true, data: customer });
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, email, businessName, gst, type, address, status, followUpDate, notes } = req.body;
    if (!name || !mobile) return res.status(400).json({ success: false, message: "name and mobile are required" });

    const customer = await prisma.customer.create({
      data: { name, mobile, email, businessName, gst, type, address, status, followUpDate: followUpDate ? new Date(followUpDate) : undefined, notes },
    });
    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create customer" });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, email, businessName, gst, type, address, status, followUpDate, notes } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: { name, mobile, email, businessName, gst, type, address, status, followUpDate: followUpDate ? new Date(followUpDate) : undefined, notes },
    });
    return res.json({ success: true, data: customer });
  } catch {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }
};

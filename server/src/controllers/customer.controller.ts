import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getCustomers = async (req: Request, res: Response) => {
  const search: string = (req.query.search as string) ?? "";
  const page: number = parseInt((req.query.page as string) ?? "1");
  const limit: number = parseInt((req.query.limit as string) ?? "20");
  const status: string | undefined = req.query.status as string | undefined;
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

export const getCustomer = async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  return res.json({ success: true, data: customer });
};

export const createCustomer = async (req: Request, res: Response) => {
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

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, businessName, gst, type, address, status, followUpDate, notes } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, mobile, email, businessName, gst, type, address, status, followUpDate: followUpDate ? new Date(followUpDate) : undefined, notes },
    });
    return res.json({ success: true, data: customer });
  } catch {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }
};

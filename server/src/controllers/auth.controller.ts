import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "../utils/prisma";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "name, email and password are required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

    const validRoles: Role[] = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
    const userRole: Role = validRoles.includes(role) ? role : "SALES";

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: userRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.status(201).json({ success: true, token: generateToken(user.id, user.role), user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const { password: _, ...safeUser } = user;
    return res.json({ success: true, token: generateToken(user.id, user.role), user: safeUser });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error?.message || "Server Error" });
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return res.json({ success: true, user });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

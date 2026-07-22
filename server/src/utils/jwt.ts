import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
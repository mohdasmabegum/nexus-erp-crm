import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get(["/health", "/api/health"], (_, res) => res.json({ success: true, message: "Nexus ERP CRM API Running" }));

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/customers", "/customers"], customerRoutes);
app.use(["/api/products", "/products"], productRoutes);
app.use(["/api/challans", "/challans"], challanRoutes);

export default app;

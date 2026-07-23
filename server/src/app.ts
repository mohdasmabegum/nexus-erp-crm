import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";

const app = express();

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// API root and health check endpoint
app.get(["/", "/api", "/health", "/api/health"], (_, res) => {
  res.json({
    success: true,
    name: "Nexus ERP CRM API",
    status: "online",
    timestamp: new Date().toISOString(),
    message: "Nexus ERP CRM API is running successfully",
  });
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/customers", "/customers"], customerRoutes);
app.use(["/api/products", "/products"], productRoutes);
app.use(["/api/challans", "/challans"], challanRoutes);

export default app;

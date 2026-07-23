import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./utils/prisma";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";

const app = express();

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan("dev"));
app.use(express.json());

// Health Check Endpoint (JSON)
app.get(["/health", "/api/health"], async (_, res) => {
  let dbStatus = "Connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "Disconnected";
  }

  return res.json({
    status: "OK",
    database: dbStatus,
    server: "Running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

// HTML API Landing Homepage (GET / or GET /api)
app.get(["/", "/api"], (req, res) => {
  if (req.headers.accept?.includes("application/json")) {
    return res.json({
      name: "NEXUS ERP CRM API",
      version: "1.0.0",
      status: "Running",
      message: "Welcome to the NEXUS ERP CRM Backend API.",
      health: "/health",
      documentation: "https://github.com/mohdasmabegum/nexus-erp-crm",
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXUS ERP CRM API — Backend Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: radial-gradient(circle at 50% 30%, #0f172a 0%, #020617 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      width: 100%;
      max-width: 640px;
      padding: 36px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 22px;
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
    }
    .dot {
      width: 8px;
      height: 8px;
      background-color: #34d399;
      border-radius: 50%;
      box-shadow: 0 0 10px #34d399;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 14px 18px;
    }
    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .endpoints {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
    }
    .method {
      font-weight: 800;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .method-get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .method-post { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .method-put { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .method-patch { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
    .path { font-family: monospace; font-weight: 600; color: #cbd5e1; }
    .links {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: #fff;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">N</div>
        <div>
          <div class="brand-title">NEXUS ERP CRM API</div>
          <div style="font-size: 12px; color: #94a3b8;">Operations Backend Engine</div>
        </div>
      </div>
      <div class="badge">
        <div class="dot"></div>
        API Online
      </div>
    </div>

    <div class="grid">
      <div class="stat-box">
        <div class="stat-label">Version</div>
        <div class="stat-value">v1.0.0</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Environment</div>
        <div class="stat-value">Production</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Database</div>
        <div class="stat-value" style="color: #34d399;">Connected</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="color: #60a5fa;">Running</div>
      </div>
    </div>

    <div class="section-title">Available REST API Endpoints</div>
    <ul class="endpoints">
      <li class="endpoint-item"><span class="path">/api/auth/login</span><span class="method method-post">POST</span></li>
      <li class="endpoint-item"><span class="path">/api/customers</span><span class="method method-get">GET / POST / PUT</span></li>
      <li class="endpoint-item"><span class="path">/api/products</span><span class="method method-get">GET / POST / PUT</span></li>
      <li class="endpoint-item"><span class="path">/api/challans</span><span class="method method-patch">GET / POST / PATCH</span></li>
      <li class="endpoint-item"><span class="path">/health</span><span class="method method-get">GET</span></li>
    </ul>

    <div class="links">
      <a href="https://nexus-erp-crm-beta.vercel.app" target="_blank" class="btn btn-primary">Launch Web App &rarr;</a>
      <a href="https://github.com/mohdasmabegum/nexus-erp-crm" target="_blank" class="btn btn-secondary">GitHub Repository</a>
      <a href="/health" class="btn btn-secondary">JSON Health Check</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  return res.send(html);
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/customers", "/customers"], customerRoutes);
app.use(["/api/products", "/products"], productRoutes);
app.use(["/api/challans", "/challans"], challanRoutes);

export default app;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Grid, Card, CardContent, Typography, Box, Chip, Skeleton,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Avatar,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api";

const statusColors: Record<string, "default" | "warning" | "success" | "error"> = {
  DRAFT: "warning", CONFIRMED: "success", CANCELLED: "error",
};

const PIE_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706"];

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function StatCard({ label, value, icon, color, path, loading }: any) {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card sx={{ cursor: "pointer", overflow: "visible" }} onClick={() => navigate(path)}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: "20px !important" }}>
          <Avatar sx={{ bgcolor: color, width: 52, height: 52, boxShadow: `0 8px 16px ${color}40` }}>
            {icon}
          </Avatar>
          <Box>
            {loading ? <Skeleton width={60} height={40} /> : (
              <Typography variant="h4" fontWeight={800} lineHeight={1}>
                <CountUp value={value ?? 0} />
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [challanStats, setChallanStats] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/customers?limit=1"),
      api.get("/products?limit=200"),
      api.get("/challans?limit=100"),
    ]).then(([c, p, ch]) => {
      const products: any[] = p.data.data;
      const challans: any[] = ch.data.data;
      const low = products.filter((pr: any) => pr.stock <= pr.minStockAlert);

      const draft = challans.filter((x: any) => x.status === "DRAFT").length;
      const confirmed = challans.filter((x: any) => x.status === "CONFIRMED").length;
      const cancelled = challans.filter((x: any) => x.status === "CANCELLED").length;

      // Category distribution
      const catMap: Record<string, number> = {};
      products.forEach((pr: any) => {
        const cat = pr.category || "Uncategorized";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Monthly challan bar chart (last 6 months)
      const monthMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthMap[d.toLocaleString("default", { month: "short" })] = 0;
      }
      challans.forEach((ch: any) => {
        const m = new Date(ch.createdAt).toLocaleString("default", { month: "short" });
        if (m in monthMap) monthMap[m]++;
      });
      setChallanStats(Object.entries(monthMap).map(([month, count]) => ({ month, count })));

      setStats({ customers: c.data.total, products: p.data.total, challans: ch.data.total, lowStock: low.length, draft, confirmed });
      setRecentChallans(challans.slice(0, 5));
      setLowStockItems(low.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: "Total Customers", value: stats?.customers, icon: <PeopleIcon />, color: "#2563eb", path: "/customers" },
    { label: "Total Products", value: stats?.products, icon: <InventoryIcon />, color: "#7c3aed", path: "/products" },
    { label: "Draft Challans", value: stats?.draft, icon: <PendingIcon />, color: "#d97706", path: "/challans" },
    { label: "Confirmed Challans", value: stats?.confirmed, icon: <CheckCircleIcon />, color: "#059669", path: "/challans" },
    { label: "Total Challans", value: stats?.challans, icon: <ReceiptIcon />, color: "#0891b2", path: "/challans" },
    { label: "Low Stock Alerts", value: stats?.lowStock, icon: <WarningAmberIcon />, color: "#dc2626", path: "/products" },
  ];

  return (
    <Box>
      <Typography variant="h5" mb={3}>Dashboard Overview</Typography>

      <Grid container spacing={2.5} mb={3}>
        {statCards.map((c, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={c.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...c} loading={loading} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" mb={2}>Monthly Challan Activity</Typography>
              {loading ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={challanStats} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Challans" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" mb={2}>Product Categories</Typography>
              {loading ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} /> : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <Typography color="text.secondary" variant="body2">No products yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1">Recent Challans</Typography>
                <Button size="small" onClick={() => navigate("/challans")}>View All →</Button>
              </Box>
              {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Challan #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentChallans.map((c) => (
                      <TableRow key={c.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate("/challans")}>
                        <TableCell sx={{ fontWeight: 600 }}>{c.challanNumber}</TableCell>
                        <TableCell>{c.customer?.name}</TableCell>
                        <TableCell>{c.totalQty}</TableCell>
                        <TableCell><Chip label={c.status} size="small" color={statusColors[c.status]} /></TableCell>
                        <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {recentChallans.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>No challans yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1">⚠️ Low Stock Alerts</Typography>
                <Button size="small" onClick={() => navigate("/products")}>View All →</Button>
              </Box>
              {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Min</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockItems.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                        <TableCell>{p.sku}</TableCell>
                        <TableCell><Chip label={p.stock} size="small" color="error" /></TableCell>
                        <TableCell>{p.minStockAlert}</TableCell>
                      </TableRow>
                    ))}
                    {lowStockItems.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>✅ All stock levels OK</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

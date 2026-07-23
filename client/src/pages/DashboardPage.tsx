import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Grid, Card, CardContent, Typography, Box, Chip, Skeleton,
  Table, TableHead, TableRow, TableCell, TableBody, Button, Avatar,
  LinearProgress, Divider, Stack,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import TodayIcon from "@mui/icons-material/Today";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";
import api from "../api";

const statusColors: Record<string, "default" | "warning" | "success" | "error"> = {
  DRAFT: "warning", CONFIRMED: "success", CANCELLED: "error",
};

const PIE_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#0891b2", "#dc2626"];

function CountUp({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const duration = 800;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString()}</>;
}

const CARD_CONFIGS = [
  {
    key: "customers",
    label: "Total Customers",
    icon: <PeopleIcon />,
    gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    shadow: "rgba(37,99,235,0.35)",
    path: "/customers",
  },
  {
    key: "products",
    label: "Total Products",
    icon: <InventoryIcon />,
    gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
    shadow: "rgba(124,58,237,0.35)",
    path: "/products",
  },
  {
    key: "draft",
    label: "Draft Challans",
    icon: <PendingIcon />,
    gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    shadow: "rgba(217,119,6,0.35)",
    path: "/challans",
  },
  {
    key: "confirmed",
    label: "Confirmed Challans",
    icon: <CheckCircleIcon />,
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    shadow: "rgba(5,150,105,0.35)",
    path: "/challans",
  },
  {
    key: "challans",
    label: "Total Challans",
    icon: <ReceiptIcon />,
    gradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    shadow: "rgba(8,145,178,0.35)",
    path: "/challans",
  },
  {
    key: "lowStock",
    label: "Low Stock Alerts",
    icon: <WarningAmberIcon />,
    gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    shadow: "rgba(220,38,38,0.35)",
    path: "/products",
  },
  {
    key: "followUps",
    label: "Today's Follow-ups",
    icon: <TodayIcon />,
    gradient: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
    shadow: "rgba(219,39,119,0.35)",
    path: "/customers",
  },
  {
    key: "totalValue",
    label: "Total Sales Value",
    icon: <TrendingUpIcon />,
    gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    shadow: "rgba(15,118,110,0.35)",
    path: "/challans",
    prefix: "₹",
  },
];

function StatCard({ label, value, icon, gradient, shadow, path, loading, prefix = "" }: any) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        sx={{ cursor: "pointer", overflow: "visible", position: "relative" }}
        onClick={() => navigate(path)}
      >
        <CardContent sx={{ p: "20px !important" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              {loading ? (
                <>
                  <Skeleton width={70} height={44} />
                  <Skeleton width={100} height={20} sx={{ mt: 0.5 }} />
                </>
              ) : (
                <>
                  <Typography variant="h4" fontWeight={800} lineHeight={1} sx={{ letterSpacing: "-0.02em" }}>
                    <CountUp value={value ?? 0} prefix={prefix} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} mt={0.5}>
                    {label}
                  </Typography>
                </>
              )}
            </Box>
            <Avatar
              sx={{
                background: gradient,
                width: 44,
                height: 44,
                boxShadow: `0 8px 20px ${shadow}`,
                flexShrink: 0,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const CustomTooltipStyle = {
  borderRadius: 10,
  border: "none",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  fontSize: "0.8rem",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [challanStats, setChallanStats] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/customers?limit=200"),
      api.get("/products?limit=200"),
      api.get("/challans?limit=200"),
    ]).then(([c, p, ch]) => {
      const customers: any[] = c.data.data;
      const products: any[] = p.data.data;
      const challans: any[] = ch.data.data;

      const low = products.filter((pr: any) => pr.stock <= pr.minStockAlert);

      const draft = challans.filter((x: any) => x.status === "DRAFT").length;
      const confirmed = challans.filter((x: any) => x.status === "CONFIRMED").length;

      // Today's follow-ups
      const today = new Date().toDateString();
      const followUps = customers.filter((cust: any) =>
        cust.followUpDate && new Date(cust.followUpDate).toDateString() === today
      ).length;

      // Total sales value from confirmed challans
      const totalValue = challans
        .filter((x: any) => x.status === "CONFIRMED")
        .reduce((sum: number, ch: any) => {
          const v = ch.items?.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0) || 0;
          return sum + v;
        }, 0);

      // Category distribution
      const catMap: Record<string, number> = {};
      products.forEach((pr: any) => {
        const cat = pr.category || "Uncategorized";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Monthly challan bar chart (last 6 months)
      const monthMap: Record<string, { count: number; value: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthMap[d.toLocaleString("default", { month: "short" })] = { count: 0, value: 0 };
      }
      challans.forEach((ch: any) => {
        const m = new Date(ch.createdAt).toLocaleString("default", { month: "short" });
        if (m in monthMap) {
          monthMap[m].count++;
          const v = ch.items?.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0) || 0;
          monthMap[m].value += v;
        }
      });
      setChallanStats(Object.entries(monthMap).map(([month, d]) => ({ month, count: d.count, value: Math.round(d.value) })));

      setStats({
        customers: c.data.total,
        products: p.data.total,
        challans: ch.data.total,
        lowStock: low.length,
        draft,
        confirmed,
        followUps,
        totalValue: Math.round(totalValue),
      });
      setRecentChallans(challans.slice(0, 6));
      setLowStockItems(low.slice(0, 5));
      setRecentCustomers(customers
        .filter((cust: any) => cust.followUpDate)
        .sort((a: any, b: any) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime())
        .slice(0, 4)
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} mb={3}>
        {CARD_CONFIGS.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={c.key}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <StatCard {...c} value={stats?.[c.key]} loading={loading} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} mb={2.5}>
        {/* Monthly Challan Activity Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Monthly Challan Activity</Typography>
                  <Typography variant="caption" color="text.secondary">Last 6 months · count & value</Typography>
                </Box>
                <Button size="small" onClick={() => navigate("/challans")}>View All →</Button>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={challanStats} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorCount)" name="Challans" dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Product Categories</Typography>
              <Typography variant="caption" color="text.secondary">Distribution by category</Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2, mt: 1.5 }} />
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.75rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220 }}>
                  <Typography color="text.secondary" variant="body2">No products yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={2.5}>
        {/* Recent Challans */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Recent Challans</Typography>
                  <Typography variant="caption" color="text.secondary">Latest sales transactions</Typography>
                </Box>
                <Button size="small" onClick={() => navigate("/challans")}>View All →</Button>
              </Box>
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} height={44} sx={{ mb: 0.5, borderRadius: 1 }} />)
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Challan #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Products</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentChallans.map((c) => (
                      <TableRow
                        key={c.id}
                        hover
                        sx={{ cursor: "pointer", transition: "background 0.15s" }}
                        onClick={() => navigate("/challans")}
                      >
                        <TableCell sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.8rem" }}>
                          {c.challanNumber}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{c.customer?.name}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {c.items?.length ?? 0} item{c.items?.length !== 1 ? "s" : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={c.status} size="small" color={statusColors[c.status]} />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentChallans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary" variant="body2">No challans yet</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2.5}>
            {/* Low Stock Alerts */}
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>⚠️ Low Stock Alerts</Typography>
                    <Typography variant="caption" color="text.secondary">Items needing restock</Typography>
                  </Box>
                  <Button size="small" onClick={() => navigate("/products")}>View All →</Button>
                </Box>
                {loading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} height={44} sx={{ mb: 0.5, borderRadius: 1 }} />)
                ) : (
                  <>
                    {lowStockItems.map((p) => {
                      const pct = Math.max(0, Math.min(100, (p.stock / Math.max(p.minStockAlert, 1)) * 100));
                      return (
                        <Box key={p.id} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Chip label={`Stock: ${p.stock}`} size="small" color={p.stock === 0 ? "error" : "warning"} />
                              <Chip label={`Min: ${p.minStockAlert}`} size="small" variant="outlined" />
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            color={p.stock === 0 ? "error" : "warning"}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      );
                    })}
                    {lowStockItems.length === 0 && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          ✅ All stock levels OK
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Today's Follow-ups */}
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>📅 Today's Follow-ups</Typography>
                    <Typography variant="caption" color="text.secondary">Scheduled customer follow-ups</Typography>
                  </Box>
                  <Button size="small" onClick={() => navigate("/customers")}>View →</Button>
                </Box>
                {loading ? (
                  [...Array(2)].map((_, i) => <Skeleton key={i} height={44} sx={{ mb: 0.5, borderRadius: 1 }} />)
                ) : recentCustomers.length > 0 ? (
                  recentCustomers.map((cust) => (
                    <Box key={cust.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 12, fontWeight: 700 }}>
                        {cust.name?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{cust.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{cust.mobile}</Typography>
                      </Box>
                      <Chip
                        label={cust.followUpDate ? new Date(cust.followUpDate).toLocaleDateString("en-IN") : ""}
                        size="small"
                        color={new Date(cust.followUpDate).toDateString() === new Date().toDateString() ? "error" : "default"}
                      />
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="body2" color="text.secondary">No follow-ups scheduled</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

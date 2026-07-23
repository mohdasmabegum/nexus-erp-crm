import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningIcon from "@mui/icons-material/Warning";
import api from "../api";

const statusColors: Record<string, "default" | "warning" | "success" | "error"> = {
  DRAFT: "warning", CONFIRMED: "success", CANCELLED: "error",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/customers?limit=1"),
      api.get("/products?limit=100"),
      api.get("/challans?limit=5"),
    ]).then(([c, p, ch]) => {
      const products: any[] = p.data.data;
      const low = products.filter((pr: any) => pr.stock <= pr.minStockAlert);
      setStats({ customers: c.data.total, products: p.data.total, challans: ch.data.total, lowStock: low.length });
      setRecentChallans(ch.data.data);
      setLowStockItems(low.slice(0, 5));
    });
  }, []);

  const cards = [
    { label: "Customers", value: stats?.customers, icon: <PeopleIcon fontSize="large" />, color: "#1976d2", path: "/customers" },
    { label: "Products", value: stats?.products, icon: <InventoryIcon fontSize="large" />, color: "#388e3c", path: "/products" },
    { label: "Challans", value: stats?.challans, icon: <ReceiptIcon fontSize="large" />, color: "#7b1fa2", path: "/challans" },
    { label: "Low Stock Items", value: stats?.lowStock, icon: <WarningIcon fontSize="large" />, color: "#f57c00", path: "/products" },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard</Typography>

      <Grid container spacing={3} mb={4}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }} onClick={() => navigate(c.path)}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: c.color }}>{c.icon}</Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats === null ? <CircularProgress size={24} /> : c.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>Recent Challans</Typography>
                <Button size="small" onClick={() => navigate("/challans")}>View All</Button>
              </Box>
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
                    <TableRow key={c.id} hover>
                      <TableCell>{c.challanNumber}</TableCell>
                      <TableCell>{c.customer?.name}</TableCell>
                      <TableCell>{c.totalQty}</TableCell>
                      <TableCell><Chip label={c.status} size="small" color={statusColors[c.status]} /></TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {recentChallans.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No challans yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>Low Stock Alerts</Typography>
                <Button size="small" onClick={() => navigate("/products")}>View All</Button>
              </Box>
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
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell><Chip label={p.stock} size="small" color="error" /></TableCell>
                      <TableCell>{p.minStockAlert}</TableCell>
                    </TableRow>
                  ))}
                  {lowStockItems.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">All stock levels OK ✓</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

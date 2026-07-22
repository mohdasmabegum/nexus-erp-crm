import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningIcon from "@mui/icons-material/Warning";
import api from "../api";

interface Stats { customers: number; products: number; challans: number; lowStock: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/customers?limit=1"),
      api.get("/products?limit=1"),
      api.get("/challans?limit=1"),
    ]).then(([c, p, ch]) => {
      const products: any[] = p.data.data;
      const lowStock = products.filter((pr: any) => pr.stock <= pr.minStockAlert).length;
      setStats({ customers: c.data.total, products: p.data.total, challans: ch.data.total, lowStock });
    });
  }, []);

  const cards = [
    { label: "Customers", value: stats?.customers, icon: <PeopleIcon fontSize="large" />, color: "#1976d2" },
    { label: "Products", value: stats?.products, icon: <InventoryIcon fontSize="large" />, color: "#388e3c" },
    { label: "Challans", value: stats?.challans, icon: <ReceiptIcon fontSize="large" />, color: "#7b1fa2" },
    { label: "Low Stock Items", value: stats?.lowStock, icon: <WarningIcon fontSize="large" />, color: "#f57c00" },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard</Typography>
      <Grid container spacing={3}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <Card>
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
    </Box>
  );
}

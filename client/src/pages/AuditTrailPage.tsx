import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Card, Avatar, Skeleton, TextField, InputAdornment, Button, Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import api from "../api";

interface Activity {
  id: string;
  type: "CHALLAN" | "STOCK" | "CUSTOMER";
  title: string;
  subtitle: string;
  user: string;
  timestamp: string;
  badgeColor: "primary" | "secondary" | "success" | "warning" | "info";
}

export default function AuditTrailPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/challans?limit=50"),
      api.get("/products?limit=50"),
      api.get("/customers?limit=50"),
    ]).then(([ch, pr, cu]) => {
      const list: Activity[] = [];

      // Challans
      ch.data.data?.forEach((c: any) => {
        list.push({
          id: `ch-${c.id}`,
          type: "CHALLAN",
          title: `Challan ${c.challanNumber} (${c.status})`,
          subtitle: `Customer: ${c.customer?.name ?? "Unknown"} · Qty: ${c.totalQty}`,
          user: c.user?.name ?? "System",
          timestamp: c.createdAt,
          badgeColor: c.status === "CONFIRMED" ? "success" : c.status === "CANCELLED" ? "secondary" : "warning",
        });
      });

      // Customers
      cu.data.data?.forEach((cust: any) => {
        list.push({
          id: `cust-${cust.id}`,
          type: "CUSTOMER",
          title: `Customer Registered: ${cust.name}`,
          subtitle: `Type: ${cust.type} · Status: ${cust.status} · Mobile: ${cust.mobile}`,
          user: "Sales Team",
          timestamp: cust.createdAt,
          badgeColor: "info",
        });
      });

      // Products
      pr.data.data?.forEach((p: any) => {
        list.push({
          id: `prod-${p.id}`,
          type: "STOCK",
          title: `Product Added/Updated: ${p.name}`,
          subtitle: `SKU: ${p.sku} · Price: ₹${p.unitPrice} · Stock: ${p.stock}`,
          user: "Warehouse",
          timestamp: p.createdAt,
          badgeColor: "primary",
        });
      });

      // Sort descending by timestamp
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = activities.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    a.user.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "CHALLAN": return <ReceiptIcon fontSize="small" />;
      case "STOCK": return <InventoryIcon fontSize="small" />;
      case "CUSTOMER": return <PeopleIcon fontSize="small" />;
      default: return <HistoryIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Activity Log & Audit Trail</Typography>
        <Typography variant="body2" color="text.secondary">Real-time system event logs and operational audit trail</Typography>
      </Box>

      <Box sx={{ mb: 2.5, display: "flex", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Filter activity logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 320 }}
        />
      </Box>

      <Card sx={{ overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 2 }}>Type</TableCell>
              <TableCell>Event Details</TableCell>
              <TableCell>Triggered By</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton sx={{ borderRadius: 1 }} /></TableCell>)}
                </TableRow>
              ))
            ) : (
              <AnimatePresence>
                {filtered.map((act, i) => (
                  <motion.tr
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="MuiTableRow-root MuiTableRow-hover"
                  >
                    <TableCell sx={{ pl: 2 }}>
                      <Chip
                        icon={getIcon(act.type)}
                        label={act.type}
                        size="small"
                        color={act.badgeColor}
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{act.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{act.subtitle}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{act.user}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(act.timestamp).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}

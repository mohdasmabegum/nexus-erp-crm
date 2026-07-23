import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Pagination, TextField, Autocomplete, Skeleton, Card, CardContent, Stack,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import api from "../api";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/products?limit=200").then(({ data }) => setProducts(data.data));
  }, []);

  const load = async (p: number, product: any) => {
    if (!product) return;
    setLoading(true);
    const { data } = await api.get(`/products/${product.id}/stock?page=${p}&limit=15`);
    setMovements(data.data);
    setTotal(data.total);
    setLoading(false);
  };

  const handleSelect = (product: any) => {
    setSelectedProduct(product);
    setPage(1);
    if (product) load(1, product);
    else { setMovements([]); setTotal(0); }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Inventory & Stock Log</Typography>
        <Typography variant="body2" color="text.secondary">Detailed stock audit log and movement history</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Autocomplete
          options={products}
          getOptionLabel={(p: any) => `${p.name} (${p.sku})`}
          onChange={(_, val) => handleSelect(val)}
          renderInput={(params) => <TextField {...params} label="Select Product to View Movement Log" size="small" />}
          sx={{ width: { xs: "100%", sm: 340 } }}
        />
        {selectedProduct && (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
            <Chip
              label={`Stock: ${selectedProduct.stock}`}
              color={selectedProduct.stock <= selectedProduct.minStockAlert ? "error" : "success"}
              sx={{ fontWeight: 700 }}
            />
            <Chip label={`Min Alert: ${selectedProduct.minStockAlert}`} variant="outlined" sx={{ fontWeight: 600 }} />
            {selectedProduct.location && <Chip label={`📍 ${selectedProduct.location}`} variant="outlined" />}
            {selectedProduct.category && <Chip label={selectedProduct.category} variant="outlined" />}
          </Stack>
        )}
      </Box>

      {!selectedProduct ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: "50%",
              bgcolor: "action.hover", display: "inline-flex",
              alignItems: "center", justifyContent: "center", mb: 2,
            }}>
              <HistoryIcon color="primary" sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} mb={1}>Select a Product</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
              Choose any product from the dropdown above to view its complete stock movement history, audit trail, and stock adjustments.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 2 }}>Movement Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Reason / Reference</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton sx={{ borderRadius: 1 }} /></TableCell>)}
                    </TableRow>
                  ))
                ) : (
                  <AnimatePresence>
                    {movements.map((m, i) => (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="MuiTableRow-root MuiTableRow-hover"
                      >
                        <TableCell sx={{ pl: 2 }}>
                          <Chip
                            label={m.type === "IN" ? "📥 STOCK IN" : "📤 STOCK OUT"}
                            size="small"
                            color={m.type === "IN" ? "success" : "error"}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.95rem", color: m.type === "IN" ? "success.main" : "error.main" }}>
                          {m.type === "IN" ? "+" : "-"}{m.quantity}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{m.reason || "—"}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{m.user?.name || "System"}</TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                          {new Date(m.createdAt).toLocaleString("en-IN")}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
                {!loading && movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                      No stock movements recorded for this product yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(total / 15)}
              page={page}
              onChange={(_, v) => { setPage(v); load(v, selectedProduct); }}
              color="primary"
            />
          </Box>
        </Card>
      )}
    </Box>
  );
}

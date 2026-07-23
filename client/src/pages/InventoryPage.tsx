import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Pagination, TextField, Autocomplete, Skeleton, Card, CardContent, Stack,
} from "@mui/material";
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
    setMovements(data.data); setTotal(data.total); setLoading(false);
  };

  const handleSelect = (product: any) => {
    setSelectedProduct(product); setPage(1);
    if (product) load(1, product);
    else { setMovements([]); setTotal(0); }
  };

  return (
    <Box>
      <Typography variant="h5" mb={3}>Inventory — Stock Movement Log</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Autocomplete options={products} getOptionLabel={(p: any) => `${p.name} (${p.sku})`}
          onChange={(_, val) => handleSelect(val)}
          renderInput={(params) => <TextField {...params} label="Select Product" size="small" />}
          sx={{ width: 320 }} />
        {selectedProduct && (
          <Stack direction="row" spacing={1}>
            <Chip label={`Stock: ${selectedProduct.stock}`} color={selectedProduct.stock <= selectedProduct.minStockAlert ? "error" : "success"} />
            <Chip label={`Min Alert: ${selectedProduct.minStockAlert}`} variant="outlined" />
            {selectedProduct.location && <Chip label={`📍 ${selectedProduct.location}`} variant="outlined" />}
            {selectedProduct.category && <Chip label={selectedProduct.category} variant="outlined" />}
          </Stack>
        )}
      </Box>

      {!selectedProduct ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>📦 Select a Product</Typography>
            <Typography variant="body2" color="text.secondary">Choose a product above to view its complete stock movement history.</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? [...Array(6)].map((_, i) => (
                <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              )) : (
                <AnimatePresence>
                  {movements.map((m, i) => (
                    <motion.tr key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="MuiTableRow-root MuiTableRow-hover">
                      <TableCell>
                        <Chip label={m.type === "IN" ? "📥 IN" : "📤 OUT"} size="small" color={m.type === "IN" ? "success" : "error"} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: m.type === "IN" ? "success.main" : "error.main" }}>
                        {m.type === "IN" ? "+" : "-"}{m.quantity}
                      </TableCell>
                      <TableCell>{m.reason || "—"}</TableCell>
                      <TableCell>{m.user?.name}</TableCell>
                      <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!loading && movements.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No movements recorded yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination count={Math.ceil(total / 15)} page={page} onChange={(_, v) => { setPage(v); load(v, selectedProduct); }} color="primary" />
          </Box>
        </>
      )}
    </Box>
  );
}

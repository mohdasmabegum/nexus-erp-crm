import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Pagination, TextField, Autocomplete, Button,
} from "@mui/material";
import api from "../api";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/products?limit=200").then(({ data }) => setProducts(data.data));
  }, []);

  const load = async (p = page, product = selectedProduct) => {
    if (!product) return;
    const { data } = await api.get(`/products/${product.id}/stock?page=${p}&limit=15`);
    setMovements(data.data);
    setTotal(data.total);
  };

  useEffect(() => { load(); }, [page]);

  const handleSelect = (product: any) => {
    setSelectedProduct(product);
    setPage(1);
    if (product) {
      api.get(`/products/${product.id}/stock?page=1&limit=15`).then(({ data }) => {
        setMovements(data.data);
        setTotal(data.total);
      });
    } else {
      setMovements([]);
      setTotal(0);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Inventory — Stock Movement Log</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <Autocomplete
          options={products}
          getOptionLabel={(p: any) => `${p.name} (${p.sku})`}
          onChange={(_, val) => handleSelect(val)}
          renderInput={(params) => <TextField {...params} label="Select Product" size="small" />}
          sx={{ width: 320 }}
        />
        {selectedProduct && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip label={`Current Stock: ${selectedProduct.stock}`} color={selectedProduct.stock <= selectedProduct.minStockAlert ? "error" : "success"} />
            <Chip label={`Min Alert: ${selectedProduct.minStockAlert}`} variant="outlined" />
            <Chip label={`Location: ${selectedProduct.location || "N/A"}`} variant="outlined" />
          </Box>
        )}
      </Box>

      {!selectedProduct ? (
        <Typography color="text.secondary">Select a product to view its stock movement history.</Typography>
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
              {movements.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Chip label={m.type} size="small" color={m.type === "IN" ? "success" : "error"} />
                  </TableCell>
                  <TableCell>{m.type === "IN" ? "+" : "-"}{m.quantity}</TableCell>
                  <TableCell>{m.reason || "-"}</TableCell>
                  <TableCell>{m.user?.name}</TableCell>
                  <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No movements recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination count={Math.ceil(total / 15)} page={page} onChange={(_, v) => setPage(v)} />
          </Box>
        </>
      )}
    </Box>
  );
}

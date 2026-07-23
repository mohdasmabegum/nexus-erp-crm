import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, IconButton, Pagination, Alert,
  Skeleton, Stack, Tooltip, Avatar, Card, LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FilterListIcon from "@mui/icons-material/FilterList";
import InputAdornment from "@mui/material/InputAdornment";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const emptyForm = { name: "", sku: "", category: "", unitPrice: "", stock: "0", minStockAlert: "0", location: "", imageUrl: "" };
const emptyStock = { quantity: "", type: "IN", reason: "" };

function StockBar({ stock, min }: { stock: number; min: number }) {
  const pct = min > 0 ? Math.min(100, (stock / (min * 2)) * 100) : 100;
  const color = stock === 0 ? "error" : stock <= min ? "warning" : "success";
  return (
    <Box sx={{ width: 80 }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 5, borderRadius: 3 }}
      />
    </Box>
  );
}

export default function ProductsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [stockForm, setStockForm] = useState(emptyStock);
  const [error, setError] = useState("");
  const [stockError, setStockError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async (p = page, s = search) => {
    setLoading(true);
    const { data } = await api.get(`/products?page=${p}&search=${s}&limit=10`);
    setProducts(data.data);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(1, search); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(""); setOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category ?? "", unitPrice: String(p.unitPrice), stock: String(p.stock), minStockAlert: String(p.minStockAlert), location: p.location ?? "", imageUrl: p.imageUrl ?? "" });
    setError(""); setOpen(true);
  };
  const openStock = (p: any) => { setSelectedProduct(p); setStockForm(emptyStock); setStockError(""); setStockOpen(true); };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      if (editing) { await api.put(`/products/${editing.id}`, form); toast.success("Product updated!"); }
      else { await api.post("/products", form); toast.success("Product added!"); }
      setOpen(false); load();
    } catch (err: any) { setError(err.response?.data?.message ?? "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleStock = async () => {
    setStockError(""); setSaving(true);
    try {
      await api.post(`/products/${selectedProduct.id}/stock`, stockForm);
      toast.success(`Stock ${stockForm.type === "IN" ? "added" : "removed"} successfully!`);
      setStockOpen(false); load();
    } catch (err: any) { setStockError(err.response?.data?.message ?? "Failed to record movement"); }
    finally { setSaving(false); }
  };

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const sf = (k: string) => (e: any) => setStockForm((prev) => ({ ...prev, [k]: e.target.value }));

  const stockColor = (p: any): "error" | "warning" | "success" =>
    p.stock === 0 ? "error" : p.stock <= p.minStockAlert ? "warning" : "success";

  const displayedProducts = lowStockOnly
    ? products.filter((p) => p.stock <= p.minStockAlert)
    : products;

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Products & Inventory</Typography>
          <Typography variant="body2" color="text.secondary">{total} total products</Typography>
        </Box>
        {canWrite && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Product</Button>
          </motion.div>
        )}
      </Box>

      {/* Filters & Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", display: "flex", alignItems: "center", gap: 1.5 }}>
          <WarningAmberIcon sx={{ color: "error.main", fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600} color="error.main">
            {lowStockCount} product{lowStockCount !== 1 ? "s" : ""} below minimum stock level
          </Typography>
          <Button
            size="small"
            variant={lowStockOnly ? "contained" : "outlined"}
            color="error"
            startIcon={<FilterListIcon />}
            onClick={() => setLowStockOnly(!lowStockOnly)}
            sx={{ ml: "auto" }}
          >
            {lowStockOnly ? "Show All" : "Show Low Stock"}
          </Button>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search name, SKU, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
        <Button variant="outlined" onClick={handleSearch}>Search</Button>

        {/* Stock status summary */}
        <Box sx={{ display: "flex", gap: 0.75, ml: "auto", flexWrap: "wrap" }}>
          {[
            { label: "Out of Stock", color: "error" as const, count: products.filter((p) => p.stock === 0).length },
            { label: "Low Stock", color: "warning" as const, count: products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length },
            { label: "In Stock", color: "success" as const, count: products.filter((p) => p.stock > p.minStockAlert).length },
          ].map(({ label, color, count }) => (
            <Chip key={label} label={`${label}: ${count}`} size="small" color={color} variant="outlined" />
          ))}
        </Box>
      </Box>

      {/* Table */}
      <Card sx={{ overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2 }}>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WarningAmberIcon sx={{ fontSize: 13, color: "warning.main" }} />
                    Min Stock
                  </Box>
                </TableCell>
                <TableCell>Stock Health</TableCell>
                <TableCell>Location</TableCell>
                {canWrite && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(canWrite ? 9 : 8)].map((_, j) => <TableCell key={j}><Skeleton sx={{ borderRadius: 1 }} /></TableCell>)}
                  </TableRow>
                ))
                : (
                  <AnimatePresence>
                    {displayedProducts.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="MuiTableRow-root MuiTableRow-hover"
                      >
                        {/* Product + image */}
                        <TableCell sx={{ pl: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            {p.imageUrl ? (
                              <Avatar src={p.imageUrl} alt={p.name} variant="rounded" sx={{ width: 36, height: 36 }} />
                            ) : (
                              <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>
                                {p.name[0]}
                              </Avatar>
                            )}
                            <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                          </Box>
                        </TableCell>

                        {/* SKU */}
                        <TableCell>
                          <Chip label={p.sku} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }} />
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{p.category ?? "—"}</Typography>
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            ₹{p.unitPrice.toLocaleString()}
                          </Typography>
                        </TableCell>

                        {/* Current Stock */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Chip
                              label={p.stock}
                              size="small"
                              color={stockColor(p)}
                              sx={{ fontWeight: 700, minWidth: 36 }}
                            />
                            {p.stock === 0 && (
                              <Chip label="OUT" size="small" color="error" variant="filled" sx={{ fontSize: "0.65rem", height: 18 }} />
                            )}
                            {p.stock > 0 && p.stock <= p.minStockAlert && (
                              <Chip label="LOW" size="small" color="warning" variant="filled" sx={{ fontSize: "0.65rem", height: 18 }} />
                            )}
                          </Box>
                        </TableCell>

                        {/* Min Stock — highlighted */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            {p.stock <= p.minStockAlert && (
                              <WarningAmberIcon sx={{ fontSize: 15, color: p.stock === 0 ? "error.main" : "warning.main" }} />
                            )}
                            <Chip
                              label={p.minStockAlert}
                              size="small"
                              color={p.stock <= p.minStockAlert ? (p.stock === 0 ? "error" : "warning") : "default"}
                              variant={p.stock <= p.minStockAlert ? "filled" : "outlined"}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                        </TableCell>

                        {/* Stock Health Bar */}
                        <TableCell>
                          <Box>
                            <StockBar stock={p.stock} min={p.minStockAlert} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                              {p.stock === 0 ? "Out of stock" : p.stock <= p.minStockAlert ? "Below minimum" : "Healthy"}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{p.location ?? "—"}</Typography>
                        </TableCell>

                        {/* Actions */}
                        {canWrite && (
                          <TableCell>
                            <Tooltip title="Edit Product">
                              <IconButton size="small" onClick={() => openEdit(p)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Stock Movement">
                              <IconButton size="small" color="primary" onClick={() => openStock(p)}>
                                <MoveToInboxIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )
              }
              {!loading && displayedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canWrite ? 9 : 8} align="center" sx={{ py: 6 }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        {lowStockOnly ? "✅ No low stock items!" : "📦 No products found"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lowStockOnly ? "All products have adequate stock levels" : "Add your first product to get started"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.93 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } } as any}>
        <DialogTitle fontWeight={700}>{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField label="Name *" value={form.name} onChange={f("name")} fullWidth />
            <TextField label="SKU *" value={form.sku} onChange={f("sku")} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Category" value={form.category} onChange={f("category")} fullWidth />
            <TextField label="Unit Price *" type="number" value={form.unitPrice} onChange={f("unitPrice")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Stack>
          <Stack direction="row" spacing={2}>
            {!editing && <TextField label="Initial Stock" type="number" value={form.stock} onChange={f("stock")} fullWidth />}
            <TextField
              label="Min Stock Alert *"
              type="number"
              value={form.minStockAlert}
              onChange={f("minStockAlert")}
              fullWidth
              helperText="Alert when stock falls below this value"
              InputProps={{ startAdornment: <InputAdornment position="start"><WarningAmberIcon sx={{ fontSize: 16, color: "warning.main" }} /></InputAdornment> }}
            />
            <TextField label="Location" value={form.location} onChange={f("location")} fullWidth />
          </Stack>
          <TextField label="Image URL (AWS S3 / CDN)" value={form.imageUrl} onChange={f("imageUrl")} placeholder="https://..." fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : (editing ? "Save Changes" : "Add Product")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.93 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } } as any}>
        <DialogTitle fontWeight={700}>Stock Movement</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {stockError && <Alert severity="error" sx={{ borderRadius: 2 }}>{stockError}</Alert>}

          {/* Product Info */}
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
              {selectedProduct?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>{selectedProduct?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedProduct?.sku}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`Current: ${selectedProduct?.stock}`}
              color={stockColor(selectedProduct ?? {})}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`Min Alert: ${selectedProduct?.minStockAlert}`}
              variant="outlined"
              icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Movement Type</InputLabel>
            <Select value={stockForm.type} label="Movement Type" onChange={sf("type")}>
              <MenuItem value="IN">📥 IN — Add Stock</MenuItem>
              <MenuItem value="OUT">📤 OUT — Remove Stock</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Quantity *" type="number" value={stockForm.quantity} onChange={sf("quantity")} fullWidth />
          <TextField label="Reason" value={stockForm.reason} onChange={sf("reason")} fullWidth placeholder="e.g. Purchase order, Damage, Sale, etc." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStock} disabled={saving}>
            {saving ? "Recording..." : "Save Movement"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, IconButton, Pagination, Alert,
  Skeleton, Stack, Tooltip, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const emptyForm = { name: "", sku: "", category: "", unitPrice: "", stock: "0", minStockAlert: "0", location: "", imageUrl: "" };
const emptyStock = { quantity: "", type: "IN", reason: "" };

export default function ProductsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
    setProducts(data.data); setTotal(data.total); setLoading(false);
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

  const stockColor = (p: any) => p.stock === 0 ? "error" : p.stock <= p.minStockAlert ? "warning" : "success";

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Products & Inventory</Typography>
          <Typography variant="body2" color="text.secondary">{total} total products</Typography>
        </Box>
        {canWrite && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Product</Button>
          </motion.div>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
        <TextField size="small" placeholder="Search name, SKU, category..." value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 300 }} />
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Image</TableCell><TableCell>Name</TableCell><TableCell>SKU</TableCell>
            <TableCell>Category</TableCell><TableCell>Unit Price</TableCell><TableCell>Stock</TableCell>
            <TableCell>Location</TableCell>{canWrite && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? [...Array(6)].map((_, i) => (
            <TableRow key={i}>{[...Array(canWrite ? 8 : 7)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
          )) : (
            <AnimatePresence>
              {products.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="MuiTableRow-root MuiTableRow-hover">
                  <TableCell>
                    {p.imageUrl ? (
                      <Avatar src={p.imageUrl} alt={p.name} variant="rounded" sx={{ width: 36, height: 36 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>
                        {p.name[0]}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell><Chip label={p.sku} size="small" variant="outlined" /></TableCell>
                  <TableCell>{p.category ?? "—"}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{p.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={p.stock} size="small" color={stockColor(p)} />
                    {p.stock <= p.minStockAlert && p.stock > 0 && <Typography variant="caption" color="warning.main" ml={0.5}>Low</Typography>}
                    {p.stock === 0 && <Typography variant="caption" color="error.main" ml={0.5}>Out</Typography>}
                  </TableCell>
                  <TableCell>{p.location ?? "—"}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Stock Movement"><IconButton size="small" color="primary" onClick={() => openStock(p)}><MoveToInboxIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
          {!loading && products.length === 0 && (
            <TableRow><TableCell colSpan={canWrite ? 8 : 7} align="center" sx={{ py: 4, color: "text.secondary" }}>No products found</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } } as any}>
        <DialogTitle fontWeight={700}>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField label="Name *" value={form.name} onChange={f("name")} fullWidth />
            <TextField label="SKU *" value={form.sku} onChange={f("sku")} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Category" value={form.category} onChange={f("category")} fullWidth />
            <TextField label="Unit Price *" type="number" value={form.unitPrice} onChange={f("unitPrice")} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            {!editing && <TextField label="Initial Stock" type="number" value={form.stock} onChange={f("stock")} fullWidth />}
            <TextField label="Min Stock Alert" type="number" value={form.minStockAlert} onChange={f("minStockAlert")} fullWidth />
            <TextField label="Location" value={form.location} onChange={f("location")} fullWidth />
          </Stack>
          <TextField label="Image URL (AWS S3 / CDN)" value={form.imageUrl} onChange={f("imageUrl")} placeholder="https://..." fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } } as any}>
        <DialogTitle fontWeight={700}>Stock Movement — {selectedProduct?.name}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {stockError && <Alert severity="error" sx={{ borderRadius: 2 }}>{stockError}</Alert>}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label={`Current: ${selectedProduct?.stock}`} color={stockColor(selectedProduct ?? {})} />
            <Chip label={`Min: ${selectedProduct?.minStockAlert}`} variant="outlined" />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={stockForm.type} label="Type" onChange={sf("type")}>
              <MenuItem value="IN">📥 IN — Add Stock</MenuItem>
              <MenuItem value="OUT">📤 OUT — Remove Stock</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Quantity *" type="number" value={stockForm.quantity} onChange={sf("quantity")} fullWidth />
          <TextField label="Reason" value={stockForm.reason} onChange={sf("reason")} fullWidth placeholder="e.g. Purchase order, Damage, etc." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStock} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

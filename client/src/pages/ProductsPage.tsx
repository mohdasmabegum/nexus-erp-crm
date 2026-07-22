import { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, IconButton, Pagination, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api";
import { useAuth } from "../AuthContext";

const emptyForm = { name: "", sku: "", category: "", unitPrice: "", stock: "0", minStockAlert: "0", location: "" };
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

  const load = async (p = page, s = search) => {
    const { data } = await api.get(`/products?page=${p}&search=${s}&limit=10`);
    setProducts(data.data);
    setTotal(data.total);
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(1, search); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(""); setOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category ?? "", unitPrice: String(p.unitPrice), stock: String(p.stock), minStockAlert: String(p.minStockAlert), location: p.location ?? "" });
    setError(""); setOpen(true);
  };
  const openStock = (p: any) => { setSelectedProduct(p); setStockForm(emptyStock); setStockError(""); setStockOpen(true); };

  const handleSave = async () => {
    setError("");
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post("/products", form);
      setOpen(false); load();
    } catch (err: any) { setError(err.response?.data?.message ?? "Failed to save"); }
  };

  const handleStock = async () => {
    setStockError("");
    try {
      await api.post(`/products/${selectedProduct.id}/stock`, stockForm);
      setStockOpen(false); load();
    } catch (err: any) { setStockError(err.response?.data?.message ?? "Failed to record movement"); }
  };

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const sf = (k: string) => (e: any) => setStockForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Products & Inventory</Typography>
        {canWrite && <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Product</Button>}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="Search name, SKU, category..." value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 320 }} />
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell><TableCell>SKU</TableCell><TableCell>Category</TableCell>
            <TableCell>Unit Price</TableCell><TableCell>Stock</TableCell><TableCell>Location</TableCell>
            {canWrite && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell>{p.category ?? "-"}</TableCell>
              <TableCell>₹{p.unitPrice}</TableCell>
              <TableCell>
                <Chip label={p.stock} size="small" color={p.stock <= p.minStockAlert ? "error" : "success"} />
              </TableCell>
              <TableCell>{p.location ?? "-"}</TableCell>
              {canWrite && (
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => openStock(p)}><MoveToInboxIcon fontSize="small" /></IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
          {products.length === 0 && <TableRow><TableCell colSpan={7} align="center">No products found</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} />
      </Box>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Name *" value={form.name} onChange={f("name")} fullWidth />
            <TextField label="SKU *" value={form.sku} onChange={f("sku")} fullWidth />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Category" value={form.category} onChange={f("category")} fullWidth />
            <TextField label="Unit Price *" type="number" value={form.unitPrice} onChange={f("unitPrice")} fullWidth />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            {!editing && <TextField label="Initial Stock" type="number" value={form.stock} onChange={f("stock")} fullWidth />}
            <TextField label="Min Stock Alert" type="number" value={form.minStockAlert} onChange={f("minStockAlert")} fullWidth />
            <TextField label="Location" value={form.location} onChange={f("location")} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Stock Movement — {selectedProduct?.name}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {stockError && <Alert severity="error">{stockError}</Alert>}
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={stockForm.type} label="Type" onChange={sf("type")}>
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="OUT">OUT</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Quantity *" type="number" value={stockForm.quantity} onChange={sf("quantity")} fullWidth />
          <TextField label="Reason" value={stockForm.reason} onChange={sf("reason")} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStock}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

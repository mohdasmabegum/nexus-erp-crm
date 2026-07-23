import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton, Pagination, Alert, Autocomplete, TextField,
  Skeleton, Stack, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const statusColors: Record<string, "default" | "warning" | "success" | "error"> = {
  DRAFT: "warning", CONFIRMED: "success", CANCELLED: "error",
};

interface LineItem { productId: string; productName: string; quantity: number; unitPrice: number; }

export default function ChallansPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "SALES";

  const [challans, setChallans] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", productName: "", quantity: 1, unitPrice: 0 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async (p = page, sf = statusFilter) => {
    setLoading(true);
    const { data } = await api.get(`/challans?page=${p}&limit=10${sf ? `&status=${sf}` : ""}`);
    setChallans(data.data); setTotal(data.total); setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = async () => {
    setError(""); setCustomerId(""); setStatus("DRAFT");
    setItems([{ productId: "", productName: "", quantity: 1, unitPrice: 0 }]);
    const [c, p] = await Promise.all([api.get("/customers?limit=200"), api.get("/products?limit=200")]);
    setCustomers(c.data.data); setProducts(p.data.data); setOpen(true);
  };

  const openDetail = async (id: string) => {
    const { data } = await api.get(`/challans/${id}`);
    setDetail(data.data); setDetailOpen(true);
  };

  const exportPdf = () => {
    if (!detail) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(37, 99, 235);
    doc.text("NEXUS ERP CRM", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text("Sales Challan / Invoice", 14, 27);
    doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.5); doc.line(14, 30, 196, 30);
    doc.setFontSize(10); doc.setTextColor(0);
    doc.text(`Challan: ${detail.challanNumber}`, 14, 38);
    doc.text(`Date: ${new Date(detail.createdAt).toLocaleDateString()}`, 14, 44);
    doc.text(`Status: ${detail.status}`, 14, 50);
    doc.text(`Customer: ${detail.customer?.name}`, 120, 38);
    doc.text(`Mobile: ${detail.customer?.mobile}`, 120, 44);
    if (detail.customer?.address) doc.text(`Address: ${detail.customer.address}`, 120, 50);
    const grandTotal = detail.items?.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0) || 0;
    autoTable(doc, {
      startY: 58,
      head: [["Product", "SKU", "Qty", "Unit Price", "Total"]],
      body: detail.items?.map((it: any) => [it.productName, it.productSku, it.quantity, `₹${it.unitPrice}`, `₹${(it.quantity * it.unitPrice).toFixed(2)}`]) || [],
      theme: "striped", headStyles: { fillColor: [37, 99, 235] },
    });
    const finalY = (doc as any).lastAutoTable?.finalY + 12 || 120;
    doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, finalY);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
    doc.text("Thank you for your business!", 14, finalY + 15);
    doc.text("Authorized Signature: _______________________", 110, finalY + 15);
    doc.save(`Invoice_${detail.challanNumber}.pdf`);
    toast.success("PDF exported!");
  };

  const setItem = (i: number, key: keyof LineItem, value: any) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: value } : item));

  const selectProduct = (i: number, product: any) => {
    if (!product) return;
    setItem(i, "productId", product.id);
    setItem(i, "productName", product.name);
    setItem(i, "unitPrice", product.unitPrice);
  };

  const handleCreate = async () => {
    setError(""); setSaving(true);
    if (!customerId) { setError("Please select a customer"); setSaving(false); return; }
    if (items.some((it) => !it.productId || it.quantity < 1)) { setError("All items need a product and quantity ≥ 1"); setSaving(false); return; }
    try {
      await api.post("/challans", { customerId, status, items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })) });
      toast.success("Challan created!");
      setOpen(false); load();
    } catch (err: any) { setError(err.response?.data?.message ?? "Failed to create challan"); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/challans/${id}/status`, { status: newStatus });
      toast.success(`Challan ${newStatus.toLowerCase()}!`);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to update status"); }
  };

  const grandTotal = detail?.items?.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0) || 0;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Sales Challans</Typography>
          <Typography variant="body2" color="text.secondary">{total} total challans</Typography>
        </Box>
        {canWrite && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Challan</Button>
          </motion.div>
        )}
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select value={statusFilter} label="Filter Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, e.target.value); }}>
            <MenuItem value="">All</MenuItem>
            {["DRAFT", "CONFIRMED", "CANCELLED"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Challan #</TableCell><TableCell>Customer</TableCell><TableCell>Total Qty</TableCell>
            <TableCell>Status</TableCell><TableCell>Created By</TableCell><TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? [...Array(5)].map((_, i) => (
            <TableRow key={i}>{[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
          )) : (
            <AnimatePresence>
              {challans.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="MuiTableRow-root MuiTableRow-hover">
                  <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{c.challanNumber}</TableCell>
                  <TableCell>{c.customer?.name}</TableCell>
                  <TableCell>{c.totalQty}</TableCell>
                  <TableCell><Chip label={c.status} size="small" color={statusColors[c.status]} /></TableCell>
                  <TableCell>{c.user?.name}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details"><IconButton size="small" onClick={() => openDetail(c.id)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    {canWrite && c.status === "DRAFT" && (
                      <>
                        <Tooltip title="Confirm"><IconButton size="small" color="success" onClick={() => updateStatus(c.id, "CONFIRMED")}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Cancel"><IconButton size="small" color="error" onClick={() => updateStatus(c.id, "CANCELLED")}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                      </>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
          {!loading && challans.length === 0 && (
            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>No challans found</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } } as any}>
        <DialogTitle fontWeight={700}>New Sales Challan</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Customer *</InputLabel>
              <Select value={customerId} label="Customer *" onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} — {c.mobile}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="DRAFT">DRAFT</MenuItem>
                <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Typography variant="subtitle2" fontWeight={700}>Line Items</Typography>
          {items.map((item, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Autocomplete options={products} getOptionLabel={(p: any) => `${p.name} (${p.sku}) — Stock: ${p.stock}`}
                onChange={(_, val) => selectProduct(i, val)}
                renderInput={(params) => <TextField {...params} label="Product *" size="small" />} sx={{ flex: 2 }} />
              <TextField label="Qty *" type="number" size="small" value={item.quantity}
                onChange={(e) => setItem(i, "quantity", parseInt(e.target.value) || 1)} sx={{ width: 90 }} />
              <TextField label="Unit Price" size="small" value={`₹${item.unitPrice}`} disabled sx={{ width: 110 }} />
              <IconButton size="small" color="error" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} disabled={items.length === 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button size="small" variant="outlined" onClick={() => setItems((prev) => [...prev, { productId: "", productName: "", quantity: 1, unitPrice: 0 }])}>
            + Add Item
          </Button>
          {items.some((it) => it.unitPrice > 0) && (
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              Estimated Total: ₹{items.reduce((s, it) => s + it.quantity * it.unitPrice, 0).toLocaleString()}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create Challan"}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } } as any}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography fontWeight={700}>Challan — {detail?.challanNumber}</Typography>
            <Chip label={detail?.status} size="small" color={statusColors[detail?.status]} sx={{ mt: 0.5 }} />
          </Box>
          <Button variant="contained" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportPdf}>Export PDF</Button>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={0.5} mb={2}>
            <Typography variant="body2"><b>Customer:</b> {detail?.customer?.name} ({detail?.customer?.mobile})</Typography>
            <Typography variant="body2"><b>Created by:</b> {detail?.user?.name} on {detail?.createdAt ? new Date(detail.createdAt).toLocaleString() : ""}</Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell>Qty</TableCell>
                <TableCell>Unit Price</TableCell><TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail?.items?.map((it: any) => (
                <TableRow key={it.id}>
                  <TableCell>{it.productName}</TableCell>
                  <TableCell>{it.productSku}</TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>₹{it.unitPrice}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{(it.quantity * it.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>Grand Total</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "primary.main", fontSize: "1rem" }}>₹{grandTotal.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

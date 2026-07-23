import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton, Pagination, Alert, Autocomplete, TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", productName: "", quantity: 1, unitPrice: 0 }]);
  const [error, setError] = useState("");

  const load = async (p = page) => {
    const { data } = await api.get(`/challans?page=${p}&limit=10`);
    setChallans(data.data); setTotal(data.total);
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = async () => {
    setError(""); setCustomerId(""); setStatus("DRAFT");
    setItems([{ productId: "", productName: "", quantity: 1, unitPrice: 0 }]);
    const [c, p] = await Promise.all([api.get("/customers?limit=100"), api.get("/products?limit=100")]);
    setCustomers(c.data.data); setProducts(p.data.data);
    setOpen(true);
  };

  const openDetail = async (id: string) => {
    const { data } = await api.get(`/challans/${id}`);
    setDetail(data.data); setDetailOpen(true);
  };

  const exportPdf = () => {
    if (!detail) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(33, 150, 243);
    doc.text("NEXUS ERP / CRM OPERATIONS", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("SALES CHALLAN / INVOICE", 14, 27);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Challan Number: ${detail.challanNumber}`, 14, 38);
    doc.text(`Date: ${new Date(detail.createdAt).toLocaleDateString()}`, 14, 44);
    doc.text(`Status: ${detail.status}`, 14, 50);

    doc.text(`Customer: ${detail.customer?.name || "N/A"}`, 120, 38);
    doc.text(`Mobile: ${detail.customer?.mobile || "N/A"}`, 120, 44);
    doc.text(`Address: ${detail.customer?.address || "N/A"}`, 120, 50);

    const tableData = detail.items?.map((it: any) => [
      it.productName,
      it.productSku,
      it.quantity,
      `₹${it.unitPrice}`,
      `₹${(it.quantity * it.unitPrice).toFixed(2)}`
    ]) || [];

    const grandTotal = detail.items?.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0) || 0;

    autoTable(doc, {
      startY: 58,
      head: [["Product Name", "SKU", "Quantity", "Unit Price", "Total Price"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [33, 150, 243] },
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 100;
    doc.setFontSize(12);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, finalY);

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Thank you for your business!", 14, finalY + 15);
    doc.text("Authorized Signature: _______________________", 110, finalY + 15);

    doc.save(`Invoice_${detail.challanNumber}.pdf`);
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
    setError("");
    if (!customerId) return setError("Please select a customer");
    if (items.some((it) => !it.productId || it.quantity < 1)) return setError("All items need a product and quantity ≥ 1");
    try {
      await api.post("/challans", { customerId, status, items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })) });
      setOpen(false); load();
    } catch (err: any) { setError(err.response?.data?.message ?? "Failed to create challan"); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/challans/${id}/status`, { status: newStatus });
      load();
    } catch (err: any) { alert(err.response?.data?.message ?? "Failed to update status"); }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Sales Challans</Typography>
        {canWrite && <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Challan</Button>}
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
          {challans.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell>{c.challanNumber}</TableCell>
              <TableCell>{c.customer?.name}</TableCell>
              <TableCell>{c.totalQty}</TableCell>
              <TableCell><Chip label={c.status} size="small" color={statusColors[c.status]} /></TableCell>
              <TableCell>{c.user?.name}</TableCell>
              <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => openDetail(c.id)}><VisibilityIcon fontSize="small" /></IconButton>
                {canWrite && c.status === "DRAFT" && (
                  <>
                    <IconButton size="small" color="success" onClick={() => updateStatus(c.id, "CONFIRMED")}><CheckCircleIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => updateStatus(c.id, "CANCELLED")}><CancelIcon fontSize="small" /></IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {challans.length === 0 && <TableRow><TableCell colSpan={7} align="center">No challans found</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} />
      </Box>

      {/* Create Challan Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Sales Challan</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: "flex", gap: 2 }}>
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
          </Box>

          <Typography variant="subtitle2">Line Items</Typography>
          {items.map((item, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Autocomplete
                options={products}
                getOptionLabel={(p: any) => `${p.name} (${p.sku}) — Stock: ${p.stock}`}
                onChange={(_, val) => selectProduct(i, val)}
                renderInput={(params) => <TextField {...params} label="Product *" size="small" />}
                sx={{ flex: 2 }}
              />
              <TextField label="Qty *" type="number" size="small" value={item.quantity}
                onChange={(e) => setItem(i, "quantity", parseInt(e.target.value) || 1)} sx={{ width: 90 }} />
              <TextField label="Unit Price" size="small" value={item.unitPrice} disabled sx={{ width: 110 }} />
              <IconButton size="small" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} disabled={items.length === 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button size="small" onClick={() => setItems((prev) => [...prev, { productId: "", productName: "", quantity: 1, unitPrice: 0 }])}>
            + Add Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Challan — {detail?.challanNumber}</span>
          <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportPdf}>Export Invoice PDF</Button>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={1}><b>Customer:</b> {detail?.customer?.name}</Typography>
          <Typography variant="body2" mb={1}><b>Status:</b> {detail?.status}</Typography>
          <Typography variant="body2" mb={2}><b>Created by:</b> {detail?.user?.name} on {detail?.createdAt ? new Date(detail.createdAt).toLocaleString() : ""}</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell>Qty</TableCell><TableCell>Unit Price</TableCell><TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail?.items?.map((it: any) => (
                <TableRow key={it.id}>
                  <TableCell>{it.productName}</TableCell>
                  <TableCell>{it.productSku}</TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>₹{it.unitPrice}</TableCell>
                  <TableCell>₹{(it.quantity * it.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

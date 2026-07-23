import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton, Pagination, Alert, Autocomplete, TextField,
  Skeleton, Stack, Tooltip, Card, Divider, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
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
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 45, "F");
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("NEXUS ERP CRM", 14, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Professional ERP & CRM Solutions", 14, 28);
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("SALES CHALLAN / INVOICE", 120, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Challan #: ${detail.challanNumber}`, 120, 28);
    doc.text(`Date: ${new Date(detail.createdAt).toLocaleDateString("en-IN")}`, 120, 34);

    doc.setTextColor(0);
    doc.setFontSize(10);
    // Customer info
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 52, 85, 35, "F");
    doc.rect(109, 52, 87, 35, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.setTextColor(100); doc.text("BILL TO", 18, 59);
    doc.setTextColor(0); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(detail.customer?.name ?? "", 18, 66);
    doc.setFontSize(9);
    doc.text(`📱 ${detail.customer?.mobile ?? ""}`, 18, 72);
    if (detail.customer?.email) doc.text(`✉ ${detail.customer.email}`, 18, 78);
    if (detail.customer?.address) doc.text(detail.customer.address, 18, 84);
    // Status + Created by
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.setTextColor(100); doc.text("ORDER DETAILS", 113, 59);
    doc.setTextColor(0); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(`Status: ${detail.status}`, 113, 66);
    doc.text(`Created by: ${detail.user?.name ?? ""}`, 113, 72);
    doc.text(`Created: ${detail.createdAt ? new Date(detail.createdAt).toLocaleString("en-IN") : ""}`, 113, 78);

    const grandTotal = detail.items?.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0) || 0;
    autoTable(doc, {
      startY: 94,
      head: [["#", "Product", "SKU", "Qty", "Unit Price", "Total"]],
      body: detail.items?.map((it: any, idx: number) => [
        idx + 1,
        it.productName,
        it.productSku ?? "",
        it.quantity,
        `₹${Number(it.unitPrice).toLocaleString()}`,
        `₹${(it.quantity * it.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ]) || [],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 25 }, 3: { cellWidth: 18 }, 4: { cellWidth: 28 }, 5: { cellWidth: 28 } },
    });
    const finalY = (doc as any).lastAutoTable?.finalY + 8 || 150;
    doc.setFillColor(37, 99, 235);
    doc.rect(120, finalY, 76, 14, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(255);
    doc.text(`GRAND TOTAL: ₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 124, finalY + 9);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120);
    doc.text("Thank you for your business!", 14, finalY + 24);
    doc.text("Authorized Signature: _______________________", 110, finalY + 24);
    doc.setDrawColor(200); doc.line(14, finalY + 35, 196, finalY + 35);
    doc.setFontSize(8);
    doc.text("Nexus ERP CRM · Professional Operations Portal · Generated electronically", 14, finalY + 41);
    doc.save(`Invoice_${detail.challanNumber}.pdf`);
    toast.success("PDF exported successfully!");
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
      toast.success("Challan created successfully!");
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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Sales Challans</Typography>
          <Typography variant="body2" color="text.secondary">{total} total challans</Typography>
        </Box>
        {canWrite && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Challan</Button>
          </motion.div>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select value={statusFilter} label="Filter Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, e.target.value); }}>
            <MenuItem value="">All</MenuItem>
            {["DRAFT", "CONFIRMED", "CANCELLED"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        {/* Status summary */}
        <Box sx={{ display: "flex", gap: 0.75, ml: "auto", flexWrap: "wrap" }}>
          {["DRAFT", "CONFIRMED", "CANCELLED"].map((s) => {
            const count = challans.filter((c) => c.status === s).length;
            return <Chip key={s} label={`${s}: ${count}`} size="small" color={statusColors[s]} variant="outlined" />;
          })}
        </Box>
      </Box>

      {/* Table */}
      <Card sx={{ overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 950 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2 }}>Challan #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocalShippingIcon sx={{ fontSize: 13 }} /> Products
                  </Box>
                </TableCell>
                <TableCell>Total Qty</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => <TableCell key={j}><Skeleton sx={{ borderRadius: 1 }} /></TableCell>)}
                  </TableRow>
                ))
                : (
                  <AnimatePresence>
                    {challans.map((c, i) => {
                      const totalAmt = c.items?.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0) || 0;
                      return (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="MuiTableRow-root MuiTableRow-hover"
                        >
                          <TableCell sx={{ pl: 2 }}>
                            <Typography variant="body2" fontWeight={800} color="primary.main" sx={{ fontFamily: "monospace" }}>
                              {c.challanNumber}
                            </Typography>
                          </TableCell>

                          {/* Customer */}
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar sx={{ width: 26, height: 26, bgcolor: "secondary.main", fontSize: 11, fontWeight: 700 }}>
                                {c.customer?.name?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{c.customer?.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{c.customer?.mobile}</Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Products — all visible */}
                          <TableCell sx={{ maxWidth: 220 }}>
                            {c.items?.length > 0 ? (
                              <Box>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, mb: 0.3 }}>
                                  {c.items.slice(0, 3).map((it: any) => (
                                    <Chip
                                      key={it.id}
                                      label={it.productName}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.68rem", height: 20, maxWidth: 140 }}
                                    />
                                  ))}
                                  {c.items.length > 3 && (
                                    <Tooltip title={c.items.slice(3).map((it: any) => it.productName).join(", ")}>
                                      <Chip
                                        label={`+${c.items.length - 3} more`}
                                        size="small"
                                        sx={{ fontSize: "0.68rem", height: 20 }}
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {c.items.length} product{c.items.length !== 1 ? "s" : ""}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>

                          {/* Total Qty */}
                          <TableCell>
                            <Chip label={c.totalQty} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                          </TableCell>

                          {/* Total Amount */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {totalAmt > 0 ? `₹${totalAmt.toLocaleString("en-IN")}` : "—"}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip label={c.status} size="small" color={statusColors[c.status]} />
                          </TableCell>

                          {/* Created By */}
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{c.user?.name}</Typography>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(c.createdAt).toLocaleDateString("en-IN")}
                            </Typography>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.25 }}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => openDetail(c.id)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {canWrite && c.status === "DRAFT" && (
                                <>
                                  <Tooltip title="Confirm Challan">
                                    <IconButton size="small" color="success" onClick={() => updateStatus(c.id, "CONFIRMED")}>
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancel Challan">
                                    <IconButton size="small" color="error" onClick={() => updateStatus(c.id, "CANCELLED")}>
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )
              }
              {!loading && challans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary" mb={1}>🧾 No challans found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {statusFilter ? `No ${statusFilter} challans` : "Create your first sales challan"}
                      </Typography>
                      {canWrite && !statusFilter && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 2 }}>
                          Create First Challan
                        </Button>
                      )}
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

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.93 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } } as any}>
        <DialogTitle fontWeight={700}>New Sales Challan</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Customer *</InputLabel>
              <Select value={customerId} label="Customer *" onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.mobile} · {c.type}</Typography>
                    </Box>
                  </MenuItem>
                ))}
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

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>Line Items</Typography>

          {items.map((item, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
              <Autocomplete
                options={products}
                getOptionLabel={(p: any) => `${p.name} (${p.sku}) — Stock: ${p.stock}`}
                onChange={(_, val) => selectProduct(i, val)}
                renderInput={(params) => <TextField {...params} label="Product *" size="small" />}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Qty *"
                type="number"
                size="small"
                value={item.quantity}
                onChange={(e) => setItem(i, "quantity", parseInt(e.target.value) || 1)}
                sx={{ width: 90 }}
              />
              <TextField
                label="Unit Price"
                size="small"
                value={item.unitPrice > 0 ? `₹${item.unitPrice}` : "—"}
                disabled
                sx={{ width: 110 }}
              />
              <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ minWidth: 80 }}>
                {item.unitPrice > 0 ? `₹${(item.quantity * item.unitPrice).toLocaleString()}` : ""}
              </Typography>
              <IconButton size="small" color="error" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} disabled={items.length === 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Button size="small" variant="outlined" onClick={() => setItems((prev) => [...prev, { productId: "", productName: "", quantity: 1, unitPrice: 0 }])}>
            + Add Item
          </Button>

          {items.some((it) => it.unitPrice > 0) && (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography fontWeight={700}>Estimated Total</Typography>
              <Typography variant="h6" fontWeight={800}>
                ₹{items.reduce((s, it) => s + it.quantity * it.unitPrice, 0).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : "Create Challan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.93 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } } as any}>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography fontWeight={800} fontSize="1.15rem">
                Challan — <span style={{ color: "#2563eb" }}>{detail?.challanNumber}</span>
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.75 }}>
                <Chip label={detail?.status} size="small" color={statusColors[detail?.status]} />
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                  {detail?.createdAt ? new Date(detail.createdAt).toLocaleString("en-IN") : ""}
                </Typography>
              </Box>
            </Box>
            <Button variant="contained" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportPdf}>
              Export PDF
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2.5}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <Box sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">Customer</Typography>
                <Typography fontWeight={700} mt={0.5}>{detail?.customer?.name}</Typography>
                <Typography variant="body2" color="text.secondary">📱 {detail?.customer?.mobile}</Typography>
                {detail?.customer?.email && <Typography variant="body2" color="primary.main" fontSize="0.8rem">✉ {detail.customer.email}</Typography>}
                {detail?.customer?.address && <Typography variant="caption" color="text.secondary">{detail.customer.address}</Typography>}
              </Box>
            </Card>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <Box sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">Created By</Typography>
                <Typography fontWeight={700} mt={0.5}>{detail?.user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">Role: {detail?.user?.role}</Typography>
              </Box>
            </Card>
          </Stack>

          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Products ({detail?.items?.length ?? 0})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail?.items?.map((it: any, idx: number) => (
                <TableRow key={it.id}>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{it.productName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={it.productSku} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }} />
                  </TableCell>
                  <TableCell><Chip label={it.quantity} size="small" /></TableCell>
                  <TableCell>₹{Number(it.unitPrice).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "success.main" }}>
                    ₹{(it.quantity * it.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 800, pt: 2 }}>Grand Total</TableCell>
                <TableCell sx={{ fontWeight: 900, color: "primary.main", fontSize: "1.1rem", pt: 2 }}>
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

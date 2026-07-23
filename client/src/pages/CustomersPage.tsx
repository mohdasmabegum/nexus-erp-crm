import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, IconButton, Pagination, Alert,
  Skeleton, Stack, Tooltip, Avatar, Card, CardContent, Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import NoteIcon from "@mui/icons-material/Note";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InputAdornment from "@mui/material/InputAdornment";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const statusColors: Record<string, "default" | "success" | "warning"> = {
  LEAD: "warning", ACTIVE: "success", INACTIVE: "default",
};

const emptyForm = {
  name: "", mobile: "", email: "", businessName: "", gst: "",
  type: "RETAIL", address: "", status: "LEAD", followUpDate: "", notes: "",
};

function CustomerAvatar({ name }: { name: string }) {
  const colors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <Avatar sx={{ width: 34, height: 34, bgcolor: color, fontSize: 13, fontWeight: 700 }}>
      {name?.[0]?.toUpperCase()}
    </Avatar>
  );
}

export default function CustomersPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "SALES";

  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<any>(null);

  const load = async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    const { data } = await api.get(`/customers?page=${p}&search=${s}&limit=10${st ? `&status=${st}` : ""}`);
    setCustomers(data.data);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(1, search, statusFilter); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(""); setOpen(true); };
  const openView = (c: any) => { setViewing(c); setViewOpen(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name, mobile: c.mobile, email: c.email ?? "", businessName: c.businessName ?? "",
      gst: c.gst ?? "", type: c.type, address: c.address ?? "", status: c.status,
      followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "", notes: c.notes ?? "",
    });
    setError(""); setOpen(true);
  };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      const payload = { ...form, followUpDate: form.followUpDate || undefined };
      if (editing) {
        await api.put(`/customers/${editing.id}`, payload);
        toast.success("Customer updated successfully!");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer added successfully!");
      }
      setOpen(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["Name", "Mobile", "Email", "Business", "Type", "Status", "Follow-up", "Notes"];
    const rows = customers.map((c) => [
      c.name, c.mobile, c.email ?? "", c.businessName ?? "", c.type, c.status,
      c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "",
      (c.notes ?? "").replace(/,/g, ";"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "customers.csv"; a.click();
    toast.success("CSV exported!");
  };

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">{total} total customers in CRM</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Export CSV">
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCSV} size="small">
              Export CSV
            </Button>
          </Tooltip>
          {canWrite && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
                Add Customer
              </Button>
            </motion.div>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search name, mobile, email, business..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: { xs: "100%", sm: 320 } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
          >
            <MenuItem value="">All</MenuItem>
            {["LEAD", "ACTIVE", "INACTIVE"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSearch}>Search</Button>

        {/* Status summary chips */}
        <Box sx={{ display: "flex", gap: 0.75, ml: "auto", flexWrap: "wrap" }}>
          {["LEAD", "ACTIVE", "INACTIVE"].map((s) => {
            const count = customers.filter((c) => c.status === s).length;
            return (
              <Chip
                key={s}
                label={`${s}: ${count}`}
                size="small"
                color={statusColors[s]}
                variant={statusFilter === s ? "filled" : "outlined"}
                onClick={() => { setStatusFilter(s === statusFilter ? "" : s); setPage(1); load(1, search, s === statusFilter ? "" : s); }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Table */}
      <Card sx={{ overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2 }}>Customer</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 14 }} /> Email
                  </Box>
                </TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Follow-up</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <NoteIcon sx={{ fontSize: 14 }} /> Notes
                  </Box>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => <TableCell key={j}><Skeleton sx={{ borderRadius: 1 }} /></TableCell>)}
                  </TableRow>
                ))
                : (
                  <AnimatePresence>
                    {customers.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="MuiTableRow-root MuiTableRow-hover"
                        style={{ cursor: "default" }}
                      >
                        {/* Customer name + avatar */}
                        <TableCell sx={{ pl: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <CustomerAvatar name={c.name} />
                            <Box>
                              <Typography variant="body2" fontWeight={700} lineHeight={1.2}>{c.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{c.gst || "No GST"}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Mobile */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{c.mobile}</Typography>
                        </TableCell>

                        {/* Email — prominently styled */}
                        <TableCell>
                          {c.email ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 13, color: "primary.main" }} />
                              <Typography
                                variant="body2"
                                component="a"
                                href={`mailto:${c.email}`}
                                sx={{
                                  color: "primary.main",
                                  textDecoration: "none",
                                  fontWeight: 500,
                                  "&:hover": { textDecoration: "underline" },
                                  fontSize: "0.8rem",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {c.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>—</Typography>
                          )}
                        </TableCell>

                        {/* Business */}
                        <TableCell>
                          <Typography variant="body2">{c.businessName || "—"}</Typography>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Chip label={c.type} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Chip label={c.status} size="small" color={statusColors[c.status]} />
                        </TableCell>

                        {/* Follow-up */}
                        <TableCell>
                          {c.followUpDate ? (
                            <Chip
                              label={new Date(c.followUpDate).toLocaleDateString("en-IN")}
                              size="small"
                              color={isOverdue(c.followUpDate) ? "error" : "default"}
                              variant={isOverdue(c.followUpDate) ? "filled" : "outlined"}
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>

                        {/* Notes — prominently shown */}
                        <TableCell sx={{ maxWidth: 200 }}>
                          {c.notes ? (
                            <Tooltip title={c.notes} placement="top">
                              <Box sx={{
                                display: "flex", alignItems: "flex-start", gap: 0.5,
                                p: 0.75, borderRadius: 1.5,
                                bgcolor: "action.hover",
                                cursor: "pointer",
                                maxWidth: 180,
                              }}>
                                <NoteIcon sx={{ fontSize: 12, color: "text.secondary", mt: 0.2, flexShrink: 0 }} />
                                <Typography variant="caption" sx={{
                                  overflow: "hidden", textOverflow: "ellipsis",
                                  display: "-webkit-box", WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical", lineHeight: 1.4,
                                  color: "text.secondary",
                                }}>
                                  {c.notes}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>No notes</Typography>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="View Customer Details">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon sx={{ fontSize: "14px !important" }} />}
                                onClick={() => openView(c)}
                                sx={{ fontSize: "0.7rem", py: 0.4, px: 1, minWidth: 0 }}
                              >
                                View
                              </Button>
                            </Tooltip>
                            {canWrite && (
                              <Tooltip title="Edit Customer">
                                <IconButton size="small" onClick={() => openEdit(c)} sx={{ color: "text.secondary" }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )
              }
              {!loading && customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary" mb={1}>👥 No customers found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || statusFilter ? "Try adjusting your search filters" : "Add your first customer to get started"}
                      </Typography>
                      {canWrite && !search && !statusFilter && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ mt: 2 }}>
                          Add First Customer
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

      {/* View Details Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.93 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } } as any}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {viewing && <CustomerAvatar name={viewing.name} />}
            <Box>
              <Typography fontWeight={700} fontSize="1.1rem">{viewing?.name}</Typography>
              <Chip
                label={viewing?.status}
                size="small"
                color={statusColors[viewing?.status ?? ""] ?? "default"}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {viewing && (
            <Stack spacing={2}>
              {/* Contact Info */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: "16px !important" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">
                    Contact Information
                  </Typography>
                  <Stack spacing={1.5} mt={1.5}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">Mobile</Typography>
                        <Typography fontWeight={600} fontSize="0.9rem">📱 {viewing.mobile}</Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        {viewing.email ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: "primary.main" }} />
                            <Typography
                              component="a"
                              href={`mailto:${viewing.email}`}
                              sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", "&:hover": { textDecoration: "underline" } }}
                            >
                              {viewing.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography color="text.secondary" fontSize="0.85rem">—</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Address</Typography>
                      <Typography fontWeight={500} fontSize="0.875rem">{viewing.address || "—"}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Business Info */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: "16px !important" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">
                    Business Details
                  </Typography>
                  <Stack spacing={1.5} mt={1.5}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">Business Name</Typography>
                        <Typography fontWeight={600} fontSize="0.875rem">{viewing.businessName || "—"}</Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">GST Number</Typography>
                        <Typography fontWeight={600} fontSize="0.875rem" sx={{ fontFamily: "monospace" }}>{viewing.gst || "—"}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip label={viewing.type} size="small" variant="outlined" />
                      {viewing.followUpDate && (
                        <Chip
                          label={`Follow-up: ${new Date(viewing.followUpDate).toLocaleDateString("en-IN")}`}
                          size="small"
                          color={isOverdue(viewing.followUpDate) ? "error" : "default"}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Notes — prominently shown */}
              {viewing.notes && (
                <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "warning.main", bgcolor: "rgba(217,119,6,0.04)" }}>
                  <CardContent sx={{ p: "16px !important" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                      <NoteIcon sx={{ fontSize: 16, color: "warning.main" }} />
                      <Typography variant="caption" color="warning.main" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">
                        Notes
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "text.primary" }}
                    >
                      {viewing.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}
              {!viewing.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", py: 1 }}>
                  No notes added yet
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          {canWrite && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setViewOpen(false); openEdit(viewing); }}>
              Edit Customer
            </Button>
          )}
          <Button variant="contained" onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.93 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } } as any}
      >
        <DialogTitle fontWeight={700}>{editing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField label="Name *" value={form.name} onChange={f("name")} fullWidth />
            <TextField label="Mobile *" value={form.mobile} onChange={f("mobile")} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Email" value={form.email} onChange={f("email")} fullWidth type="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 16 }} /></InputAdornment> }} />
            <TextField label="Business Name" value={form.businessName} onChange={f("businessName")} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="GST Number" value={form.gst} onChange={f("gst")} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={f("type")}>
                {["RETAIL", "WHOLESALE", "DISTRIBUTOR"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={f("status")}>
                {["LEAD", "ACTIVE", "INACTIVE"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Follow-up Date"
              type="date"
              value={form.followUpDate}
              onChange={f("followUpDate")}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <TextField label="Address" value={form.address} onChange={f("address")} fullWidth />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={f("notes")}
            fullWidth
            multiline
            rows={3}
            placeholder="Add any important notes about this customer..."
            InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}><NoteIcon sx={{ fontSize: 16, color: "text.secondary" }} /></InputAdornment> }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : (editing ? "Save Changes" : "Add Customer")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

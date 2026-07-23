import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, IconButton, Pagination, Alert,
  Skeleton, Stack, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const statusColors: Record<string, "default" | "success" | "warning"> = {
  LEAD: "warning", ACTIVE: "success", INACTIVE: "default",
};

const emptyForm = { name: "", mobile: "", email: "", businessName: "", gst: "", type: "RETAIL", address: "", status: "LEAD", followUpDate: "", notes: "" };

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
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, mobile: c.mobile, email: c.email ?? "", businessName: c.businessName ?? "", gst: c.gst ?? "", type: c.type, address: c.address ?? "", status: c.status, followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "", notes: c.notes ?? "" });
    setError(""); setOpen(true);
  };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      const payload = { ...form, followUpDate: form.followUpDate || undefined };
      if (editing) { await api.put(`/customers/${editing.id}`, payload); toast.success("Customer updated!"); }
      else { await api.post("/customers", payload); toast.success("Customer added!"); }
      setOpen(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Customers</Typography>
          <Typography variant="body2" color="text.secondary">{total} total customers</Typography>
        </Box>
        {canWrite && (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Customer</Button>
          </motion.div>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <TextField size="small" placeholder="Search name, mobile, business..." value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 300 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}>
            <MenuItem value="">All</MenuItem>
            {["LEAD", "ACTIVE", "INACTIVE"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell><TableCell>Mobile</TableCell><TableCell>Business</TableCell>
            <TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Follow-up</TableCell>
            {canWrite && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? [...Array(6)].map((_, i) => (
            <TableRow key={i}>{[...Array(canWrite ? 7 : 6)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
          )) : (
            <AnimatePresence>
              {customers.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ cursor: "default" }}
                  className="MuiTableRow-root MuiTableRow-hover">
                  <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell>{c.mobile}</TableCell>
                  <TableCell>{c.businessName ?? "—"}</TableCell>
                  <TableCell><Chip label={c.type} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={c.status} size="small" color={statusColors[c.status]} /></TableCell>
                  <TableCell>{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "—"}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
          {!loading && customers.length === 0 && (
            <TableRow><TableCell colSpan={canWrite ? 7 : 6} align="center" sx={{ py: 4, color: "text.secondary" }}>No customers found</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ component: motion.div, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } } as any}>
        <DialogTitle fontWeight={700}>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField label="Name *" value={form.name} onChange={f("name")} fullWidth />
            <TextField label="Mobile *" value={form.mobile} onChange={f("mobile")} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Email" value={form.email} onChange={f("email")} fullWidth />
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
            <TextField label="Follow-up Date" type="date" value={form.followUpDate} onChange={f("followUpDate")} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
          <TextField label="Address" value={form.address} onChange={f("address")} fullWidth />
          <TextField label="Notes" value={form.notes} onChange={f("notes")} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

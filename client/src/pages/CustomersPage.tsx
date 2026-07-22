import { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, IconButton, Pagination, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = async (p = page, s = search) => {
    const { data } = await api.get(`/customers?page=${p}&search=${s}&limit=10`);
    setCustomers(data.data);
    setTotal(data.total);
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); load(1, search); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(""); setOpen(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, mobile: c.mobile, email: c.email ?? "", businessName: c.businessName ?? "", gst: c.gst ?? "", type: c.type, address: c.address ?? "", status: c.status, followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "", notes: c.notes ?? "" });
    setError("");
    setOpen(true);
  };

  const handleSave = async () => {
    setError("");
    try {
      const payload = { ...form, followUpDate: form.followUpDate || undefined };
      if (editing) await api.put(`/customers/${editing.id}`, payload);
      else await api.post("/customers", payload);
      setOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save");
    }
  };

  const f = (k: string) => (e: any) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Customers</Typography>
        {canWrite && <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Customer</Button>}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="Search name, mobile, business..." value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 320 }} />
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
          {customers.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.mobile}</TableCell>
              <TableCell>{c.businessName ?? "-"}</TableCell>
              <TableCell>{c.type}</TableCell>
              <TableCell><Chip label={c.status} size="small" color={statusColors[c.status]} /></TableCell>
              <TableCell>{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "-"}</TableCell>
              {canWrite && <TableCell><IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></TableCell>}
            </TableRow>
          ))}
          {customers.length === 0 && <TableRow><TableCell colSpan={7} align="center">No customers found</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Name *" value={form.name} onChange={f("name")} fullWidth />
            <TextField label="Mobile *" value={form.mobile} onChange={f("mobile")} fullWidth />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Email" value={form.email} onChange={f("email")} fullWidth />
            <TextField label="Business Name" value={form.businessName} onChange={f("businessName")} fullWidth />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="GST Number" value={form.gst} onChange={f("gst")} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={f("type")}>
                {["RETAIL", "WHOLESALE", "DISTRIBUTOR"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={f("status")}>
                {["LEAD", "ACTIVE", "INACTIVE"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Follow-up Date" type="date" value={form.followUpDate} onChange={f("followUpDate")} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField label="Address" value={form.address} onChange={f("address")} fullWidth />
          <TextField label="Notes" value={form.notes} onChange={f("notes")} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

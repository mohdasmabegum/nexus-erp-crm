import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Divider, Chip, Stack } from "@mui/material";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const credentials = [
  { role: "ADMIN", email: "admin@nexus.com", password: "admin123", color: "error" as const },
  { role: "SALES", email: "sales@nexus.com", password: "sales123", color: "primary" as const },
  { role: "WAREHOUSE", email: "warehouse@nexus.com", password: "warehouse123", color: "warning" as const },
  { role: "ACCOUNTS", email: "accounts@nexus.com", password: "accounts123", color: "success" as const },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillCredential = (cred: typeof credentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Card sx={{ width: { xs: "100%", sm: 420 } }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h4" fontWeight={800} sx={{ color: "primary.main", letterSpacing: "-1px" }}>🔷 Nexus ERP</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>Operations Portal — Sign in to continue</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ py: 1.5 }}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">Quick Login</Typography></Divider>

            <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
              {credentials.map((c) => (
                <Chip key={c.role} label={c.role} color={c.color} size="small" clickable onClick={() => fillCredential(c)}
                  sx={{ fontWeight: 700 }} />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
              Click a role to auto-fill credentials
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

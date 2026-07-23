import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Divider, Chip, Stack,
  InputAdornment, Container,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const credentials = [
  { role: "ADMIN", name: "System Admin", email: "admin@nexus.com", password: "admin123", color: "error" as const, icon: <AdminPanelSettingsIcon fontSize="small" /> },
  { role: "SALES", name: "Sales Executive", email: "sales@nexus.com", password: "sales123", color: "primary" as const, icon: <PointOfSaleIcon fontSize="small" /> },
  { role: "WAREHOUSE", name: "Stock Manager", email: "warehouse@nexus.com", password: "warehouse123", color: "warning" as const, icon: <WarehouseIcon fontSize="small" /> },
  { role: "ACCOUNTS", name: "Accountant", email: "accounts@nexus.com", password: "accounts123", color: "success" as const, icon: <AccountBalanceIcon fontSize="small" /> },
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
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredential = (cred: typeof credentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
    toast.success(`Loaded demo credentials for ${cred.role}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 30%, #0f172a 0%, #020617 100%)",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient glow shapes */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.1) 60%, transparent 100%)",
          filter: "blur(60px)",
          top: "15%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card
            sx={{
              borderRadius: 5,
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
            }}
          >
            {/* Top color bar */}
            <Box sx={{ height: 4, background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)" }} />

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Header with logo & title */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    mb: 1.5,
                  }}
                >
                  <Box component="img" src="/logo.png" alt="Nexus ERP" sx={{ height: 48, width: "auto", objectFit: "contain" }} />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{
                    background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Nexus ERP CRM
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.75)", mt: 0.5, fontSize: "0.85rem", fontWeight: 500 }}>
                  Operations Portal — Sign in to continue
                </Typography>
              </Box>

              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5, fontSize: "0.85rem", fontWeight: 600 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="name@company.com"
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                    "& .MuiOutlinedInput-root": {
                      color: "#ffffff",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(96, 165, 250, 0.6)" },
                      "&.Mui-focused fieldset": { borderColor: "#60a5fa" },
                    },
                    "& input::placeholder": { color: "rgba(255, 255, 255, 0.4)", opacity: 1 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ fontSize: 18, color: "#60a5fa" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  placeholder="••••••••"
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                    "& .MuiOutlinedInput-root": {
                      color: "#ffffff",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(96, 165, 250, 0.6)" },
                      "&.Mui-focused fieldset": { borderColor: "#60a5fa" },
                    },
                    "& input::placeholder": { color: "rgba(255, 255, 255, 0.4)", opacity: 1 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 18, color: "#60a5fa" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                    sx={{
                      py: 1.4,
                      borderRadius: 3,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      boxShadow: "0 8px 20px rgba(37,99,235,0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
                        boxShadow: "0 12px 28px rgba(37,99,235,0.55)",
                      },
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In to Portal"}
                  </Button>
                </motion.div>
              </Box>

              <Divider sx={{ my: 3.5, borderColor: "rgba(255,255,255,0.15)" }}>
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  DEMO QUICK LOGIN
                </Typography>
              </Divider>

              {/* Quick Login Roles */}
              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                {credentials.map((c) => (
                  <motion.div key={c.role} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Chip
                      icon={c.icon}
                      label={c.role}
                      color={c.color}
                      clickable
                      onClick={() => fillCredential(c)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 2,
                        px: 0.5,
                        borderRadius: 2.5,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    />
                  </motion.div>
                ))}
              </Stack>

              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.65)", display: "block", textAlign: "center", mt: 1.5, fontSize: "0.75rem" }}>
                Click any role above to auto-fill credentials
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.75rem" }}>
              © 2026 Nexus ERP CRM · All rights reserved
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from "@mui/material";
import api from "../api";
import { useAuth } from "../AuthContext";

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
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100" }}>
      <Card sx={{ width: 380 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={1}>Nexus ERP CRM</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Sign in to your account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

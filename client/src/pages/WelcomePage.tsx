import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Typography, Button, LinearProgress, Container } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const duration = 4800; // 4.8 seconds
    const intervalTime = 30;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate("/login", { replace: true });
          return 100;
        }
        const next = prev + step;
        setTimeLeft(Math.max(1, Math.ceil(((100 - next) / 100) * (duration / 1000))));
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 35%, #0f172a 0%, #020617 100%)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        p: 3,
      }}
    >
      {/* Dynamic Background Glow Blobs */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.1) 60%, transparent 100%)",
          filter: "blur(60px)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Animated Big Logo Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, type: "spring", stiffness: 180, damping: 20 }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3.5,
              borderRadius: 6,
              bgcolor: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 25px 60px rgba(37, 99, 235, 0.35)",
              mb: 4,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Nexus ERP Logo"
                sx={{
                  height: { xs: 100, sm: 130 },
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(37,99,235,0.6))",
                }}
              />
            </motion.div>
          </Box>
        </motion.div>

        {/* Animated App Name & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 1.5,
              fontSize: { xs: "2.2rem", sm: "3rem" },
            }}
          >
            Nexus ERP CRM
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ color: "rgba(255, 255, 255, 0.75)", fontWeight: 500, mb: 4, letterSpacing: "0.02em" }}
          >
            Enterprise Operations & Customer Management Portal
          </Typography>
        </motion.div>

        {/* Loading Bar & Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box sx={{ width: "100%", maxW: 360, mx: "auto", mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)",
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", display: "block", mb: 3 }}>
            Opening portal in {timeLeft}s…
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/login", { replace: true })}
            sx={{
              py: 1.5,
              px: 4.5,
              borderRadius: 3,
              fontSize: "1rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 10px 25px rgba(37,99,235,0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
                boxShadow: "0 14px 32px rgba(37,99,235,0.55)",
              },
            }}
          >
            Continue to Login
          </Button>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box sx={{ position: "absolute", bottom: 24, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.75rem" }}>
          © 2026 Nexus ERP CRM · All rights reserved
        </Typography>
      </Box>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Typography, Button, LinearProgress, Container } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5s splash
    const intervalTime = 30;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate("/login", { replace: true });
          return 100;
        }
        return prev + step;
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
        background: "radial-gradient(circle at 50% 30%, #1e293b 0%, #0a0f1e 100%)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        p: 3,
      }}
    >
      {/* Background ambient glow circles */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(124,58,237,0.05) 70%, transparent 100%)",
          filter: "blur(40px)",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xs" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 18 }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 2.5,
              borderRadius: 4,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 50px rgba(37, 99, 235, 0.25)",
              mb: 3,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Nexus ERP"
              sx={{
                height: 72,
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 12px rgba(37,99,235,0.5))",
              }}
            />
          </Box>
        </motion.div>

        {/* Animated Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 1.5,
            }}
          >
            Nexus ERP CRM
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 500, mb: 4, letterSpacing: "0.01em" }}
          >
            Professional ERP & CRM Operations Portal
          </Typography>
        </motion.div>

        {/* Loading Progress & Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box sx={{ width: "100%", mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/login", { replace: true })}
            sx={{
              py: 1.4,
              px: 4,
              borderRadius: 3,
              fontSize: "0.95rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 8px 20px rgba(37,99,235,0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
                boxShadow: "0 12px 28px rgba(37,99,235,0.5)",
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

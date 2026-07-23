import { createTheme, alpha } from "@mui/material";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2563eb", light: "#3b82f6", dark: "#1d4ed8" },
      secondary: { main: "#7c3aed", light: "#8b5cf6", dark: "#6d28d9" },
      success: { main: "#059669" },
      warning: { main: "#d97706" },
      error: { main: "#dc2626" },
      background: {
        default: mode === "light" ? "#f1f5f9" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#1e293b",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === "light"
              ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
              : "0 1px 3px rgba(0,0,0,0.4)",
            borderRadius: 16,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: "none", fontWeight: 600 },
          contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 600 } } },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === "light" ? "#1e293b" : "#0f172a",
            color: "#fff",
            borderRight: "none",
          },
        },
      },
    },
  });

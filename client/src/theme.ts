import { createTheme } from "@mui/material";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#2563eb",
        light: "#3b82f6",
        dark: "#1d4ed8",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#7c3aed",
        light: "#8b5cf6",
        dark: "#6d28d9",
        contrastText: "#ffffff",
      },
      success: { main: "#059669", light: "#10b981", dark: "#047857" },
      warning: { main: "#d97706", light: "#f59e0b", dark: "#b45309" },
      error: { main: "#dc2626", light: "#ef4444", dark: "#b91c1c" },
      info: { main: "#0891b2", light: "#06b6d4", dark: "#0e7490" },
      background: {
        default: mode === "light" ? "#f1f5f9" : "#0a0f1e",
        paper: mode === "light" ? "#ffffff" : "#111827",
      },
      text: {
        primary: mode === "light" ? "#0f172a" : "#f1f5f9",
        secondary: mode === "light" ? "#475569" : "#94a3b8",
      },
      divider: mode === "light" ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      h1: { fontWeight: 800, letterSpacing: "-0.025em" },
      h2: { fontWeight: 800, letterSpacing: "-0.025em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.015em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 700, letterSpacing: "-0.005em" },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { letterSpacing: "0.01em" },
      body2: { letterSpacing: "0.01em" },
      button: { fontWeight: 600, textTransform: "none" as const, letterSpacing: "0.01em" },
      caption: { letterSpacing: "0.02em" },
    },
    shape: { borderRadius: 12 },
    shadows: [
      "none",
      mode === "light"
        ? "0 1px 2px rgba(0,0,0,0.05)"
        : "0 1px 2px rgba(0,0,0,0.3)",
      mode === "light"
        ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
        : "0 1px 3px rgba(0,0,0,0.4)",
      mode === "light"
        ? "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)"
        : "0 4px 6px rgba(0,0,0,0.4)",
      mode === "light"
        ? "0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)"
        : "0 10px 15px rgba(0,0,0,0.4)",
      mode === "light"
        ? "0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.02)"
        : "0 20px 25px rgba(0,0,0,0.4)",
      ...Array(19).fill(mode === "light" ? "0 25px 50px -12px rgba(0,0,0,0.12)" : "0 25px 50px rgba(0,0,0,0.5)"),
    ] as any,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(100,116,139,0.4) transparent",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === "light"
              ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
              : "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
            borderRadius: 16,
            border: mode === "light" ? "1px solid rgba(15,23,42,0.06)" : "1px solid rgba(255,255,255,0.05)",
            backgroundImage: "none",
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "8px 18px",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
              transform: "translateY(-1px)",
            },
            "&:active": { transform: "translateY(0)" },
          },
          outlined: {
            "&:hover": { transform: "translateY(-1px)" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.75rem",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: mode === "light" ? "#64748b" : "#94a3b8",
            borderBottom: mode === "light" ? "2px solid rgba(15,23,42,0.08)" : "2px solid rgba(255,255,255,0.07)",
            whiteSpace: "nowrap",
            padding: "12px 16px",
          },
          body: {
            padding: "10px 16px",
            borderBottom: mode === "light" ? "1px solid rgba(15,23,42,0.05)" : "1px solid rgba(255,255,255,0.04)",
            fontSize: "0.875rem",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&.MuiTableRow-hover:hover": {
              backgroundColor: mode === "light" ? "rgba(37,99,235,0.04)" : "rgba(37,99,235,0.08)",
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === "light"
              ? "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)"
              : "linear-gradient(180deg, #020617 0%, #0a0f1e 100%)",
            color: "#fff",
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              "& fieldset": {
                borderColor: mode === "light" ? "rgba(15,23,42,0.15)" : "rgba(255,255,255,0.1)",
              },
              "&:hover fieldset": {
                borderColor: mode === "light" ? "rgba(37,99,235,0.4)" : "rgba(59,130,246,0.4)",
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            boxShadow: mode === "light"
              ? "0 25px 50px -12px rgba(0,0,0,0.25)"
              : "0 25px 50px rgba(0,0,0,0.6)",
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            "& .MuiPaginationItem-root": {
              borderRadius: 8,
              fontWeight: 600,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: "0.75rem",
            fontWeight: 500,
            padding: "6px 12px",
            backgroundColor: mode === "light" ? "#0f172a" : "#1e293b",
          },
          arrow: {
            color: mode === "light" ? "#0f172a" : "#1e293b",
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
            borderRadius: 10,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4 },
        },
      },
    },
  });

import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Chip, Tooltip, Avatar,
  Breadcrumbs, Link, InputBase, Badge, useMediaQuery, useTheme as useMuiTheme,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useAuth } from "./AuthContext";
import { useThemeMode } from "./ThemeContext";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/", description: "Overview & KPIs" },
  { label: "Customers", icon: <PeopleIcon />, path: "/customers", description: "CRM & Leads" },
  { label: "Products", icon: <InventoryIcon />, path: "/products", description: "Catalog & Stock" },
  { label: "Inventory", icon: <WarehouseIcon />, path: "/inventory", description: "Stock Movements" },
  { label: "Challans", icon: <ReceiptIcon />, path: "/challans", description: "Sales & Invoices" },
];

const roleColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  ADMIN: "error", SALES: "primary", WAREHOUSE: "warning", ACCOUNTS: "success",
};

const pageTitles: Record<string, string[]> = {
  "/": ["Dashboard"],
  "/customers": ["Customers"],
  "/products": ["Products & Inventory"],
  "/inventory": ["Inventory", "Stock Log"],
  "/challans": ["Sales", "Challans"],
  "/profile": ["Profile"],
  "/settings": ["Settings"],
};

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useThemeMode();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumbs = pageTitles[location.pathname] ?? ["Page"];

  const drawerContent = (
    <>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: "10px",
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(37,99,235,0.4)", flexShrink: 0,
        }}>
          <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.5px" }}>N</Typography>
        </Box>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
            Nexus ERP
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CRM Portal
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ ml: "auto", color: "rgba(255,255,255,0.5)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", px: 1, mb: 1 }}>
          Navigation
        </Typography>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <ListItemButton
                  selected={active}
                  onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    px: 1.5,
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    bgcolor: active ? "rgba(37,99,235,0.85)" : "transparent",
                    backdropFilter: active ? "blur(8px)" : "none",
                    boxShadow: active ? "0 4px 12px rgba(37,99,235,0.35)" : "none",
                    "&:hover": {
                      bgcolor: active ? "rgba(37,99,235,0.9)" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                    },
                    "&.Mui-selected": { bgcolor: "rgba(37,99,235,0.85)" },
                    "&.Mui-selected:hover": { bgcolor: "rgba(37,99,235,0.9)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 36, opacity: active ? 1 : 0.7 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: "0.875rem" }}
                    secondaryTypographyProps={{ fontSize: "0.65rem", color: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", sx: { mt: 0 } }}
                  />
                  {active && (
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#60a5fa", flexShrink: 0 }} />
                  )}
                </ListItemButton>
              </motion.div>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: "auto", px: 1.5, pb: 2, borderTop: "1px solid rgba(255,255,255,0.06)", pt: 2 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", px: 1, mb: 1 }}>
          Account
        </Typography>
        {[
          { label: "Profile", icon: <PersonIcon sx={{ fontSize: 18 }} />, path: "/profile" },
          { label: "Settings", icon: <SettingsIcon sx={{ fontSize: 18 }} />, path: "/settings" },
        ].map((item) => (
          <motion.div key={item.path} whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <ListItemButton
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: "10px", py: 0.75, px: 1.5, mb: 0.3,
                color: "rgba(255,255,255,0.5)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.8rem", fontWeight: 500 }} />
            </ListItemButton>
          </motion.div>
        ))}

        <Box sx={{ mt: 2, mx: 1, p: 1.5, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 11, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </Typography>
              <Chip label={user?.role} size="small" color={roleColors[user?.role ?? ""] ?? "default"} sx={{ height: 16, fontSize: "0.6rem", mt: 0.3 }} />
            </Box>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={() => { logout(); navigate("/login"); }} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#ef4444" } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
          backdropFilter: "blur(8px)",
          backgroundImage: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2, minHeight: "60px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ mr: 0.5 }}>
                <MenuIcon />
              </IconButton>
            )}
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="img" src="/logo.png" alt="Nexus ERP" sx={{ height: 32, width: "auto", objectFit: "contain" }} />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="h6" sx={{ color: "primary.main", letterSpacing: "-0.5px", lineHeight: 1.1, fontWeight: 800, fontSize: "1rem" }}>
                  Nexus ERP
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1, fontSize: "0.65rem" }}>
                  Operations Portal
                </Typography>
              </Box>
            </Box>

            {/* Breadcrumbs */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", ml: 1 }}>
              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, height: 20, alignSelf: "center" }} />
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ opacity: 0.4, fontSize: "0.9rem" }} />}
                sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
              >
                {breadcrumbs.map((crumb, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    sx={{
                      fontWeight: i === breadcrumbs.length - 1 ? 700 : 500,
                      color: i === breadcrumbs.length - 1 ? "text.primary" : "text.secondary",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {crumb}
                  </Typography>
                ))}
              </Breadcrumbs>
            </Box>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Global Search */}
            <Box sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center", gap: 1,
              bgcolor: mode === "light" ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.06)",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "10px",
              px: 1.5, py: 0.6, mr: 1,
              cursor: "text",
              transition: "all 0.2s",
              "&:hover": { borderColor: "primary.main", bgcolor: mode === "light" ? "rgba(37,99,235,0.04)" : "rgba(37,99,235,0.08)" },
            }}>
              <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <InputBase
                placeholder="Quick search…"
                sx={{ fontSize: "0.8rem", color: "text.secondary", width: 160, "& input": { p: 0 } }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", bgcolor: "action.hover", px: 0.75, py: 0.2, borderRadius: 1, fontSize: "0.65rem", fontWeight: 600 }}>
                ⌘K
              </Typography>
            </Box>

            {/* Dark mode */}
            <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}>
              <IconButton onClick={toggle} size="small" sx={{ borderRadius: "10px" }}>
                {mode === "light" ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* User avatar (desktop only) */}
            <Tooltip title={`${user?.name} — ${user?.role}`}>
              <Box
                sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, cursor: "pointer", px: 1, py: 0.5, borderRadius: "10px", "&:hover": { bgcolor: "action.hover" } }}
                onClick={() => navigate("/profile")}
              >
                <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 11, fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.2, fontSize: "0.75rem" }}>
                    {user?.name}
                  </Typography>
                  <Chip label={user?.role} size="small" color={roleColors[user?.role ?? ""] ?? "default"} sx={{ height: 14, fontSize: "0.6rem" }} />
                </Box>
              </Box>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", display: "flex", flexDirection: "column" },
          }}
        >
          <Toolbar sx={{ minHeight: "60px !important" }} />
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", display: "flex", flexDirection: "column" } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: "60px",
          minHeight: "calc(100vh - 60px)",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <Box component="footer" sx={{ mt: "auto", pt: 4, pb: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{
                width: 20, height: 20, borderRadius: "6px",
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.65rem" }}>N</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Nexus ERP CRM</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              © 2026 Nexus ERP CRM. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Built with ❤️ — Node.js · React · PostgreSQL
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

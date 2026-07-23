import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Chip, Tooltip, Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from "./AuthContext";
import { useThemeMode } from "./ThemeContext";

const DRAWER_WIDTH = 230;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { label: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { label: "Products", icon: <InventoryIcon />, path: "/products" },
  { label: "Inventory", icon: <WarehouseIcon />, path: "/inventory" },
  { label: "Challans", icon: <ReceiptIcon />, path: "/challans" },
];

const roleColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  ADMIN: "error", SALES: "primary", WAREHOUSE: "warning", ACCOUNTS: "success",
};

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useThemeMode();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: "primary.main", letterSpacing: "-0.5px" }}>
              🔷 Nexus ERP
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
              Operations Portal
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}>
              <IconButton onClick={toggle} size="small">
                {mode === "light" ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: "none", sm: "block" } }}>{user?.name}</Typography>
            <Chip label={user?.role} size="small" color={roleColors[user?.role ?? ""] ?? "default"} />
            <Tooltip title="Logout">
              <IconButton size="small" onClick={() => { logout(); navigate("/login"); }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Navigation
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <motion.div key={item.path} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <ListItemButton
                  selected={active}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2, mb: 0.5,
                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                    bgcolor: active ? "primary.main" : "transparent",
                    "&:hover": { bgcolor: active ? "primary.dark" : "rgba(255,255,255,0.08)", color: "#fff" },
                    "&.Mui-selected": { bgcolor: "primary.main" },
                    "&.Mui-selected:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: "0.875rem" }} />
                  {active && <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#fff", ml: 1 }} />}
                </ListItemButton>
              </motion.div>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, minHeight: "100vh", bgcolor: "background.default" }}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
}

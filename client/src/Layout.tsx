import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { useAuth } from "./AuthContext";

const DRAWER_WIDTH = 220;

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

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Nexus ERP CRM</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">{user?.name}</Typography>
            <Chip label={user?.role} size="small" color={roleColors[user?.role ?? ""] ?? "default"} />
            <IconButton color="inherit" onClick={() => { logout(); navigate("/login"); }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItemButton key={item.path} selected={location.pathname === item.path} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}

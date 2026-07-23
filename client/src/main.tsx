import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider, useThemeMode } from "./ThemeContext";
import { getTheme } from "./theme";
import Layout from "./Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import ChallansPage from "./pages/ChallansPage";
import InventoryPage from "./pages/InventoryPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function ThemedApp() {
  const { mode } = useThemeMode();
  return (
    <MuiThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontFamily: "Inter, sans-serif" } }} />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
            <Route path="/challans" element={<PrivateRoute><ChallansPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

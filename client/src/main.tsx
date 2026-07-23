import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./AuthContext";
import Layout from "./Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import ChallansPage from "./pages/ChallansPage";
import InventoryPage from "./pages/InventoryPage";

const theme = createTheme({ palette: { mode: "light", primary: { main: "#1565c0" } } });

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="/challans" element={<PrivateRoute><ChallansPage /></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);

import { Box, Card, CardContent, Typography, Switch, FormControlLabel, Divider, Stack, Button } from "@mui/material";
import { useThemeMode } from "../ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StorageIcon from "@mui/icons-material/Storage";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { mode, toggle } = useThemeMode();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight={800} mb={3}>
        System Settings
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Appearance & Theme
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <DarkModeIcon sx={{ color: "primary.main" }} />
                <Box>
                  <Typography variant="body1" fontWeight={600}>Dark Mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Switch between light and dark visual themes
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={<Switch checked={mode === "dark"} onChange={toggle} color="primary" />}
                label={mode === "dark" ? "Dark" : "Light"}
              />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Preferences & Notifications
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NotificationsIcon sx={{ color: "warning.main" }} />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Low Stock Email Alerts</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive notifications when stock levels fall below minimum alert values
                    </Typography>
                  </Box>
                </Box>
                <Switch defaultChecked color="primary" />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StorageIcon sx={{ color: "success.main" }} />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Automatic Inventory Sync</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Real-time updates across sales challans and stock movements
                    </Typography>
                  </Box>
                </Box>
                <Switch defaultChecked color="primary" />
              </Box>
            </Stack>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() => toast.success("Settings saved successfully!")}
              >
                Save Preferences
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

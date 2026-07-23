import { Box, Card, CardContent, Typography, Avatar, Chip, Divider, Stack, Grid } from "@mui/material";
import { useAuth } from "../AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import ShieldIcon from "@mui/icons-material/Shield";

const roleColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  ADMIN: "error", SALES: "primary", WAREHOUSE: "warning", ACCOUNTS: "success",
};

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight={800} mb={3}>
        User Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center", p: 2 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: "primary.main",
                  fontSize: 36,
                  fontWeight: 800,
                  mb: 2,
                  boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                {user?.email}
              </Typography>
              <Chip
                label={user?.role}
                color={roleColors[user?.role ?? ""] ?? "default"}
                sx={{ fontWeight: 700 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PersonIcon sx={{ color: "text.secondary" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight={600}>{user?.name}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EmailIcon sx={{ color: "text.secondary" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email Address</Typography>
                    <Typography variant="body1" fontWeight={600}>{user?.email}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ShieldIcon sx={{ color: "text.secondary" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Role / Permissions</Typography>
                    <Typography variant="body1" fontWeight={600}>{user?.role}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BadgeIcon sx={{ color: "text.secondary" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">User ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", bgcolor: "action.hover", px: 1, py: 0.5, borderRadius: 1 }}>
                      {user?.id}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

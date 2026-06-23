import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Tabs, Tab, Stack, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useAuth } from '../context/useAuth';

const NAV_TABS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Patients', path: '/patients', icon: <PeopleIcon fontSize="small" /> },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const currentTab = NAV_TABS.findIndex((t) => location.pathname.startsWith(t.path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <LocalHospitalIcon fontSize="large" />
            <Typography variant="h6" sx={{ mt: 0.25, ml: 1 }}>
              HDLC Clinic
            </Typography>
          </Stack>
          <Tabs
            value={currentTab === -1 ? false : currentTab}
            onChange={(_, idx) => navigate(NAV_TABS[idx].path)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
            sx={{ mx: 2 }}
          >
            {NAV_TABS.map((tab) => (
              <Tab
                key={tab.path}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }}
              />
            ))}
          </Tabs>
          <Button color="secondary" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, CircularProgress, Stack, Divider, Avatar, Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import CakeIcon from '@mui/icons-material/Cake';
import PersonIcon from '@mui/icons-material/Person';
import apiClient from '../api/client';
import { useToast } from '../context/useToast';

function StatCard({ icon, label, value, color }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 52, height: 52 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    apiClient
      .get('/patients')
      .then((res) => setPatients(res.data))
      .catch(() => showToast('Failed to load dashboard data', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const total = patients.length;
  const male = patients.filter((p) => p.gender === 'Male').length;
  const female = patients.filter((p) => p.gender === 'Female').length;
//   const other = patients.filter((p) => p.gender === 'Other').length;

  const today = new Date();
  const avgAge =
    total > 0
      ? Math.round(
          patients.reduce((sum, p) => {
            const birth = new Date(p.birthDate);
            const age = today.getFullYear() - birth.getFullYear();
            return sum + age;
          }, 0) / total
        )
      : 0;

  const recent = [...patients]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const getFullName = (p) =>
    [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');

  const genderColor = { Male: 'primary', Female: 'secondary', Other: 'warning' };

  return (
    <Box p={3} sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }} >

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<PeopleIcon />} label="Total Patients" value={total} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<MaleIcon />} label="Male" value={male} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<FemaleIcon />} label="Female" value={female} color="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<CakeIcon />} label="Avg. Age" value={avgAge} color="success" />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 , mt:2}}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recently Added Patients
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {recent.length === 0 ? (
          <Typography color="text.secondary">No patients recorded yet.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {recent.map((p) => (
              <Stack key={p.id} direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 16 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={500}>{getFullName(p)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(p.birthDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip
                  label={p.gender}
                  size="small"
                  color={genderColor[p.gender] || 'default'}
                  variant="outlined"
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

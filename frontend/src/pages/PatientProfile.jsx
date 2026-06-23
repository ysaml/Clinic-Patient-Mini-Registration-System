import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CakeIcon from '@mui/icons-material/Cake';
import CallIcon from '@mui/icons-material/Call';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import MedicationIcon from '@mui/icons-material/Medication';
import BiotechIcon from '@mui/icons-material/Biotech';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import apiClient from '../api/client';
import AddPatientModal from '../components/AddPatientModal';
import { useToast } from '../context/useToast';

function ProfileCard({ title, icon, children, chipLabel, action }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {chipLabel ? <Chip label={chipLabel} size="small" color="primary" variant="outlined" /> : null}
          {action}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let active = true;

    apiClient
      .get(`/patients/${id}`)
      .then((response) => {
        if (active) {
          setPatient(response.data);
        }
      })
      .catch(() => {
        if (active) {
          showToast('Failed to load patient profile', 'error');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, showToast]);

  const reloadPatient = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/patients/${id}`);
      setPatient(response.data);
    } catch {
      showToast('Failed to load patient profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const age = useMemo(() => {
    if (!patient?.birthDate) return '-';
    const birth = new Date(patient.birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDelta = now.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
      years -= 1;
    }
    return years;
  }, [patient]);

  const fullName = useMemo(() => {
    if (!patient) return '';
    return [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
  }, [patient]);

  const initials = useMemo(() => {
    if (!patient) return '';
    return [patient.firstName?.[0], patient.lastName?.[0]].filter(Boolean).join('').toUpperCase();
  }, [patient]);

  const formatText = (text, fallback) => {
    if (!text || !text.trim()) return <Typography color="text.secondary">{fallback}</Typography>;
    return (
      <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
        {text}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Patient not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 2,
          p: 2,
        }}
      >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Edit profile">
              <IconButton color="primary" size="small" onClick={() => setEditOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ px: 1, pb: 1 }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <Avatar sx={{ width: 104, height: 104, border: '4px solid white', bgcolor: 'primary.main', fontSize: 34 }}>
                {initials || <PersonIcon fontSize="large" />}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>{fullName}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip label={patient.gender || 'Not set'} size="small" color="primary" variant="outlined" />
                  <Chip label={`${age} years old`} size="small" color="secondary" variant="outlined" />
                </Stack>
              </Box>
            </Stack>
          </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileCard
            title="Patient Info"
            icon={<PersonIcon color="primary" />}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CakeIcon color="action" fontSize="small" />
                <Typography variant="body2">{new Date(patient.birthDate).toLocaleDateString()}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CallIcon color="action" fontSize="small" />
                <Typography variant="body2">{patient.contactNumber || 'No contact number'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FmdGoodIcon color="action" fontSize="small" />
                <Typography variant="body2">{patient.address || 'No address listed'}</Typography>
              </Stack>
            </Stack>
          </ProfileCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileCard title="Clinical Profile" icon={<AssignmentTurnedInIcon color="primary" />}>
            {formatText(patient.clinicalProfile, 'No clinical profile added yet.')}
          </ProfileCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileCard title="Diagnosis" icon={<AssignmentTurnedInIcon color="primary" />} chipLabel="Current">
            {formatText(patient.diagnosis, 'No diagnosis recorded yet.')}
          </ProfileCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileCard title="Current Medications" icon={<MedicationIcon color="primary" />}>
            {formatText(patient.currentMedications, 'No medications recorded yet.')}
          </ProfileCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ProfileCard title="Latest Labs" icon={<BiotechIcon color="primary" />}>
            {formatText(patient.latestLabs, 'No lab results recorded yet.')}
          </ProfileCard>
        </Grid>
      </Grid>

      <AddPatientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          reloadPatient();
        }}
        patient={patient}
      />
    </Box>
  );
}

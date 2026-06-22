import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import apiClient from '../api/client';
import { useToast } from '../context/useToast';

export default function PatientForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', birthDate: '', gender: '', contactNumber: '', address: ''
  });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/patients/${id}`);
        setForm({
          firstName: res.data.firstName ?? '',
          middleName: res.data.middleName ?? '',
          lastName: res.data.lastName ?? '',
          birthDate: res.data.birthDate ? res.data.birthDate.split('T')[0] : '',
          gender: res.data.gender ?? '',
          contactNumber: res.data.contactNumber ?? '',
          address: res.data.address ?? '',
        });
      } catch {
        showToast('Failed to load patient details', 'error');
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate, showToast]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/patients/${id}`, form);
        showToast('Patient updated successfully', 'success');
      } else {
        await apiClient.post('/patients', form);
        showToast('Patient added successfully', 'success');
      }
      navigate('/patients');
    } catch {
      showToast('Failed to save patient record', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">{isEditMode ? 'Edit Patient' : 'Add Patient'}</Typography>
          <Button color="secondary" component={Link} to="/patients" startIcon={<ArrowBackIcon />}>
            Back to List
          </Button>
        </Toolbar>
      </AppBar>

      <Box p={3}>
        <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>
            {isEditMode ? 'Update patient record details.' : 'Enter the details below to register a new patient.'}
          </Typography>

          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Birth Date"
                    name="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    multiline
                    minRows={2}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => navigate('/patients')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import apiClient from '../api/client';
import { useToast } from '../context/useToast';

// Philippine mobile number: exactly 11 digits
const PH_NUMBER_REGEX = /^\d{11}$/;

// Get only digits from input
const getDigitCount = (value) => {
  return value.replace(/\D/g, '').length;
};

// Check if number is valid (exactly 11 digits)
const isValidPHNumber = (value) => {
  const digits = value.replace(/\D/g, '');
  return PH_NUMBER_REGEX.test(digits);
};

const buildPatientForm = (patient) => ({
  firstName: patient?.firstName ?? '',
  middleName: patient?.middleName ?? '',
  lastName: patient?.lastName ?? '',
  birthDate: patient?.birthDate ? patient.birthDate.split('T')[0] : '',
  gender: patient?.gender ?? '',
  contactNumber: patient?.contactNumber ?? '',
  address: patient?.address ?? '',
});

export default function AddPatientModal({ open, onClose, onSaved, patient = null }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => buildPatientForm(patient));
  const [contactError, setContactError] = useState('');
  const { showToast } = useToast();

  const isEditMode = !!patient;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber') {
      // Allow only numeric characters and limit to 11 digits
      const numericOnly = value.replace(/\D/g, '').slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: numericOnly }));
      
      // Real-time validation
      if (numericOnly.length === 0) {
        setContactError('');
      } else if (numericOnly.length < 11) {
        setContactError('');
      } else if (!isValidPHNumber(numericOnly)) {
        setContactError('Phone number must be exactly 11 digits');
      } else {
        setContactError('');
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (saving) return;
    setForm(buildPatientForm(patient));
    setContactError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const digits = form.contactNumber.replace(/\D/g, '');
    if (!isValidPHNumber(form.contactNumber)) {
      setContactError('Phone number must be exactly 11 digits');
      return;
    }
    const payload = { ...form, contactNumber: digits };
    setSaving(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/patients/${patient.id}`, payload);
        showToast('Patient updated successfully', 'success');
      } else {
        await apiClient.post('/patients', payload);
        showToast('Patient added successfully', 'success');
      }
      setForm(buildPatientForm(patient));
      onClose();
      onSaved();
    } catch {
      showToast(`Failed to ${isEditMode ? 'update' : 'add'} patient`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditMode ? <EditIcon fontSize="large" /> : <AddIcon fontSize="large" />}
        <span>{isEditMode ? 'Edit Patient' : 'Add Patient'}</span>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
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
                placeholder="09165123794"
                type="tel"
                error={!!contactError}
                helperText={contactError || `${form.contactNumber.length}/11 digits`}
                inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*' }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'action.active', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                    endAdornment: form.contactNumber && (
                      <InputAdornment position="end">
                        {isValidPHNumber(form.contactNumber) ? (
                          <CheckCircleIcon sx={{ color: 'success.main' }} />
                        ) : getDigitCount(form.contactNumber) > 0 ? (
                          <ErrorIcon sx={{ color: 'error.main' }} />
                        ) : null}
                      </InputAdornment>
                    ),
                  },
                }}
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
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : isEditMode ? <EditIcon /> : <AddIcon />}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

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
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import apiClient from '../api/client';
import { useToast } from '../context/useToast';

// --- Birthday helpers ---
const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i);

const getDaysInMonth = (month, year) => {
  if (!month) return 31;
  return new Date(year || CURRENT_YEAR, parseInt(month, 10), 0).getDate();
};

const computeAge = (year, month, day) => {
  if (!year || !month || !day) return null;
  const birth = new Date(`${year}-${month}-${day}`);
  if (isNaN(birth) || birth > new Date()) return null;
  const today = new Date();
  let yrs = today.getFullYear() - birth.getFullYear();
  let mos = today.getMonth() - birth.getMonth();
  if (mos < 0 || (mos === 0 && today.getDate() < birth.getDate())) { yrs--; mos += 12; }
  if (today.getDate() < birth.getDate()) mos--;
  if (yrs < 0) return null;
  if (yrs === 0) return `${mos} month${mos !== 1 ? 's' : ''} old`;
  if (mos <= 0) return `${yrs} year${yrs !== 1 ? 's' : ''} old`;
  return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo${mos !== 1 ? 's' : ''} old`;
};

// --- Philippine provinces ---
const PH_PROVINCES = [
  'Abra','Agusan del Norte','Agusan del Sur','Aklan','Albay','Antique','Apayao',
  'Aurora','Basilan','Bataan','Batanes','Batangas','Benguet','Biliran','Bohol',
  'Bukidnon','Bulacan','Cagayan','Camarines Norte','Camarines Sur','Camiguin',
  'Capiz','Catanduanes','Cavite','Cebu','Cotabato','Davao de Oro','Davao del Norte',
  'Davao del Sur','Davao Occidental','Davao Oriental','Dinagat Islands',
  'Eastern Samar','Guimaras','Ifugao','Ilocos Norte','Ilocos Sur','Iloilo',
  'Isabela','Kalinga','La Union','Laguna','Lanao del Norte','Lanao del Sur',
  'Leyte','Maguindanao del Norte','Maguindanao del Sur','Marinduque','Masbate',
  'Metro Manila (NCR)','Misamis Occidental','Misamis Oriental','Mountain Province',
  'Negros Occidental','Negros Oriental','Northern Samar','Nueva Ecija','Nueva Vizcaya',
  'Occidental Mindoro','Oriental Mindoro','Palawan','Pampanga','Pangasinan',
  'Quezon','Quirino','Rizal','Romblon','Samar','Sarangani','Siquijor','Sorsogon',
  'South Cotabato','Southern Leyte','Sultan Kudarat','Sulu','Surigao del Norte',
  'Surigao del Sur','Tarlac','Tawi-Tawi','Zambales','Zamboanga del Norte',
  'Zamboanga del Sur','Zamboanga Sibugay',
];

// Try to parse a stored address string back into structured fields
const parseAddress = (address) => {
  if (!address) return { addrStreet: '', addrBarangay: '', addrCity: '', addrProvince: '', addrZip: '' };
  const parts = address.split(', ').map((s) => s.trim());
  const last = parts[parts.length - 1];
  const hasZip = /^\d{4}$/.test(last);
  const offset = hasZip ? 1 : 0;
  if (parts.length >= 4 + offset) {
    const zip = hasZip ? last : '';
    const province = parts[parts.length - 1 - offset];
    if (PH_PROVINCES.includes(province)) {
      const city = parts[parts.length - 2 - offset];
      const barangayRaw = parts[parts.length - 3 - offset];
      const street = parts.slice(0, parts.length - 3 - offset).join(', ');
      const barangay = barangayRaw.replace(/^Brgy\.\s*/i, '');
      return { addrStreet: street, addrBarangay: barangay, addrCity: city, addrProvince: province, addrZip: zip };
    }
  }
  return { addrStreet: address, addrBarangay: '', addrCity: '', addrProvince: '', addrZip: '' };
};

// --- Contact helpers ---
const PH_NUMBER_REGEX = /^\d{11}$/;
const getDigitCount = (value) => value.replace(/\D/g, '').length;
const isValidPHNumber = (value) => PH_NUMBER_REGEX.test(value.replace(/\D/g, ''));

const buildPatientForm = (patient) => {
  const dateParts = patient?.birthDate ? patient.birthDate.split('T')[0].split('-') : [];
  const addr = parseAddress(patient?.address ?? '');
  return {
    firstName: patient?.firstName ?? '',
    middleName: patient?.middleName ?? '',
    lastName: patient?.lastName ?? '',
    birthMonth: dateParts[1] ?? '',
    birthDay: dateParts[2] ?? '',
    birthYear: dateParts[0] ?? '',
    gender: patient?.gender ?? '',
    contactNumber: patient?.contactNumber ?? '',
    clinicalProfile: patient?.clinicalProfile ?? '',
    diagnosis: patient?.diagnosis ?? '',
    currentMedications: patient?.currentMedications ?? '',
    latestLabs: patient?.latestLabs ?? '',
    ...addr,
  };
};

export default function AddPatientModal({ open, onClose, onSaved, patient = null }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => buildPatientForm(patient));
  const [contactError, setContactError] = useState('');
  const [zipError, setZipError] = useState('');
  const { showToast } = useToast();

  const isEditMode = !!patient;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      const numericOnly = value.replace(/\D/g, '').slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: numericOnly }));
      setContactError(numericOnly.length === 11 && !isValidPHNumber(numericOnly) ? 'Phone number must be exactly 11 digits' : '');
      return;
    }

    if (name === 'addrZip') {
      const numericOnly = value.replace(/\D/g, '').slice(0, 4);
      setForm((prev) => ({ ...prev, [name]: numericOnly }));
      setZipError(numericOnly.length > 0 && numericOnly.length < 4 ? 'ZIP code must be 4 digits' : '');
      return;
    }

    // Clamp birthDay when month/year changes
    if (name === 'birthMonth' || name === 'birthYear') {
      const newMonth = name === 'birthMonth' ? value : form.birthMonth;
      const newYear = name === 'birthYear' ? value : form.birthYear;
      const maxDay = getDaysInMonth(newMonth, newYear);
      const clampedDay = form.birthDay && parseInt(form.birthDay, 10) > maxDay
        ? String(maxDay).padStart(2, '0')
        : form.birthDay;
      setForm((prev) => ({ ...prev, [name]: value, birthDay: clampedDay }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (saving) return;
    setForm(buildPatientForm(patient));
    setContactError('');
    setZipError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPHNumber(form.contactNumber)) {
      setContactError('Phone number must be exactly 11 digits');
      return;
    }
    if (form.addrZip && form.addrZip.length !== 4) {
      setZipError('ZIP code must be 4 digits');
      return;
    }

    const birthDate = `${form.birthYear}-${form.birthMonth}-${form.birthDay}`;
    const address = [
      form.addrStreet,
      form.addrBarangay && `Brgy. ${form.addrBarangay}`,
      form.addrCity,
      form.addrProvince,
      form.addrZip,
    ].filter(Boolean).join(', ');

    const payload = {
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      birthDate,
      gender: form.gender,
      contactNumber: form.contactNumber.replace(/\D/g, ''),
      address,
      clinicalProfile: form.clinicalProfile,
      diagnosis: form.diagnosis,
      currentMedications: form.currentMedications,
      latestLabs: form.latestLabs,
    };

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

  const age = computeAge(form.birthYear, form.birthMonth, form.birthDay);
  const days = Array.from(
    { length: getDaysInMonth(form.birthMonth, form.birthYear) },
    (_, i) => String(i + 1).padStart(2, '0'),
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditMode ? <EditIcon fontSize="large" /> : <AddIcon fontSize="large" />}
        <span>{isEditMode ? 'Edit Patient' : 'Add Patient'}</span>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>

            {/* Name */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required disabled={saving} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} disabled={saving} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required disabled={saving} />
            </Grid>

            {/* Date of Birth */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Date of Birth
                {age && (
                  <Box component="span" sx={{ ml: 1, fontWeight: 600, color: 'primary.main' }}>· {age}</Box>
                )}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField select fullWidth label="Month" name="birthMonth" value={form.birthMonth}
                    onChange={handleChange} required disabled={saving}>
                    <MenuItem value=""><em>Select month</em></MenuItem>
                    {MONTHS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 5, sm: 3 }}>
                  <TextField select fullWidth label="Day" name="birthDay" value={form.birthDay}
                    onChange={handleChange} required disabled={saving || !form.birthMonth}>
                    <MenuItem value=""><em>Day</em></MenuItem>
                    {days.map((d) => <MenuItem key={d} value={d}>{parseInt(d, 10)}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 7, sm: 4 }}>
                  <TextField select fullWidth label="Year" name="birthYear" value={form.birthYear}
                    onChange={handleChange} required disabled={saving}>
                    <MenuItem value=""><em>Year</em></MenuItem>
                    {YEARS.map((y) => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            {/* Gender & Contact */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Gender" name="gender" value={form.gender}
                onChange={handleChange} required disabled={saving}>
                <MenuItem value=""><em>Select Gender</em></MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth label="Contact Number" name="contactNumber" value={form.contactNumber}
                onChange={handleChange} required disabled={saving} placeholder="09XXXXXXXXX"
                type="tel" error={!!contactError}
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
                        {isValidPHNumber(form.contactNumber)
                          ? <CheckCircleIcon sx={{ color: 'success.main' }} />
                          : getDigitCount(form.contactNumber) > 0 ? <ErrorIcon sx={{ color: 'error.main' }} /> : null}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Address */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Address
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="House No. / Street" name="addrStreet" value={form.addrStreet}
                onChange={handleChange} required disabled={saving} placeholder="e.g. 123 Rizal Street" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Barangay" name="addrBarangay" value={form.addrBarangay}
                onChange={handleChange} disabled={saving} placeholder="e.g. San Antonio" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="City / Municipality" name="addrCity" value={form.addrCity}
                onChange={handleChange} disabled={saving} placeholder="e.g. Quezon City" />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField select fullWidth label="Province" name="addrProvince" value={form.addrProvince}
                onChange={handleChange} disabled={saving}>
                <MenuItem value=""><em>Select Province</em></MenuItem>
                {PH_PROVINCES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="ZIP Code" name="addrZip" value={form.addrZip}
                onChange={handleChange} disabled={saving} placeholder="e.g. 1100"
                error={!!zipError} helperText={zipError}
                inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Clinical Dashboard Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Clinical Profile"
                name="clinicalProfile"
                value={form.clinicalProfile}
                onChange={handleChange}
                disabled={saving}
                placeholder="Summary of patient history, risk factors, and relevant notes"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Diagnosis"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                disabled={saving}
                placeholder="Primary and secondary diagnosis"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Current Medications"
                name="currentMedications"
                value={form.currentMedications}
                onChange={handleChange}
                disabled={saving}
                placeholder="Medication names, doses, and schedule"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Latest Labs"
                name="latestLabs"
                value={form.latestLabs}
                onChange={handleChange}
                disabled={saving}
                placeholder="Recent laboratory results"
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button type="submit" color="primary" variant="contained" disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : isEditMode ? <EditIcon /> : <AddIcon />}>
            {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

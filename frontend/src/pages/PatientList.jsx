import { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, Typography, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, TableSortLabel, Chip, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AddPatientModal from '../components/AddPatientModal';
import { useToast } from '../context/useToast';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');
  const { showToast } = useToast();

  const loadPatients = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await apiClient.get('/patients');
      setPatients(res.data);
    } catch {
      showToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getPatientName = (patient) =>
    [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedPatients = patients
    .filter((p) => {
      const matchesSearch = searchTerm === '' || 
        getPatientName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
      
      return matchesSearch && matchesGender;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'birthDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const clearFilters = () => {
    setSearchTerm('');
    setGenderFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || genderFilter !== 'All';

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPatients]);
  
  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/patients/${deleteTarget.id}`);
      showToast(`${getPatientName(deleteTarget)} removed`, 'success');
      setDeleteTarget(null);
      loadPatients();
    } catch {
      showToast('Failed to delete patient', 'error');
    }
  };

  const handleEditPatient = (patient) => {
    setEditTarget(patient);
  };

  const handleClosePatientModal = () => {
    setAddModalOpen(false);
    setEditTarget(null);
  };

  return (
    <Box  sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }} >
      <Box p={2}>
        <Box
          sx={{
            p: 1,
            mb: 1,
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by name, contact, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={genderFilter}
                label="Gender"
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear
              </Button>
            )}
            <Button
              color="secondary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
              size="large"
              sx={{ whiteSpace: 'nowrap', minWidth: 150 }}
            >
              Add Patient
            </Button>
          </Stack>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ maxHeight: 600, boxShadow: 'none', borderRadius: 2, overflow: 'auto' }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'firstName'}
                    direction={sortField === 'firstName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('firstName')}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'middleName'}
                    direction={sortField === 'middleName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('middleName')}
                  >
                    Middle Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'lastName'}
                    direction={sortField === 'lastName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'birthDate'}
                    direction={sortField === 'birthDate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('birthDate')}
                  >
                    Birth Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'gender'}
                    direction={sortField === 'gender' ? sortDirection : 'asc'}
                    onClick={() => handleSort('gender')}
                  >
                    Gender
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'contactNumber'}
                    direction={sortField === 'contactNumber' ? sortDirection : 'asc'}
                    onClick={() => handleSort('contactNumber')}
                  >
                    Contact
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'address'}
                    direction={sortField === 'address' ? sortDirection : 'asc'}
                    onClick={() => handleSort('address')}
                  >
                    Address
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No patients yet — add your first one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No patients match your search criteria
                    </Typography>
                    <Button size="small" onClick={clearFilters} sx={{ mt: 1 }}>
                      Clear filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedPatients.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.firstName}</TableCell>
                    <TableCell>{p.middleName}</TableCell>
                    <TableCell>{p.lastName}</TableCell>
                    <TableCell>{new Date(p.birthDate).toLocaleDateString()}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.contactNumber}</TableCell>
                    <TableCell
                      title={p.address}
                      sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {p.address}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="info" onClick={() => navigate(`/patients/${p.id}`)}>
                        <BadgeIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditPatient(p)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="warning" onClick={() => setDeleteTarget(p)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
          {!loading && (
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 2 }}>
              <InfoIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Showing <strong>{filteredAndSortedPatients.length}</strong> of <strong>{patients.length}</strong> patient{patients.length !== 1 ? 's' : ''}
              </Typography>
              {hasActiveFilters && (
                <Chip 
                  label="Filtered" 
                  size="small" 
                  color="primary" 
                  icon={<FilterListIcon />}
                  sx={{ ml: 2 }} 
                />
              )}
            </Stack>
          )}
      </Box>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, color: 'warning.main' }}>
          <WarningIcon fontSize="large" />
          Delete Record
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Permanently remove <strong>{deleteTarget ? getPatientName(deleteTarget) : 'this patient'}</strong>'s record? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="secondary" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <AddPatientModal
        open={addModalOpen}
        onClose={handleClosePatientModal}
        onSaved={() => loadPatients()}
      />

      {editTarget && (
        <AddPatientModal
          open
          patient={editTarget}
          onClose={handleClosePatientModal}
          onSaved={() => loadPatients()}
        />
      )}
    </Box>
  );
}

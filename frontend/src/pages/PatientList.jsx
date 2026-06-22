import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, Typography, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, AppBar, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import apiClient from '../api/client';
import AddPatientModal from '../components/AddPatientModal';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">Patient Records</Typography>
          <Button color="secondary" startIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box p={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {loading ? 'Loading...' : `${patients.length} patient${patients.length !== 1 ? 's' : ''}`}
          </Typography>
          <Button color="secondary" variant="contained" startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
            Add Patient
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Middle Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Birth Date</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Address</TableCell>
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
              ) : (
                patients.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.firstName}</TableCell>
                    <TableCell>{p.middleName}</TableCell>
                    <TableCell>{p.lastName}</TableCell>
                    <TableCell>{new Date(p.birthDate).toLocaleDateString()}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.contactNumber}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell align="right">
                      <IconButton component={Link} to={`/patients/${p.id}/edit`} size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="secondary" onClick={() => setDeleteTarget(p)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete patient record?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently remove {deleteTarget ? getPatientName(deleteTarget) : 'this patient'}'s record. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="secondary" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <AddPatientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={() => loadPatients()}
      />
    </Box>
  );
}
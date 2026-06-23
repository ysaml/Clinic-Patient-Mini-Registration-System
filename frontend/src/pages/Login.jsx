import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import apiClient from '../api/client';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      login(res.data.token);
      showToast('Logged in successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Invalid username or password', 'error');
      } else if (err.response) {
        showToast('An error occurred. Please try again.', 'error');
      } else {
        showToast('Unable to reach the server. Please check your connection.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2.5,
        py: 4,
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        align="center"
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
        }}
      >
        <LockIcon sx={{  color: 'primary.main' }} />
        <Typography align="center" component="h1" variant="h5" color="primary" sx={{ fontWeight: 700 }}>
          Clinic Login
        </Typography>
        <Typography align="center" sx={{ mt: 1, color: 'text.secondary' }}>
          Sign in to continue.
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            fullWidth
            autoComplete="username"
            sx={fieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            fullWidth
            autoComplete="current-password"
            sx={fieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      onClick={() => !loading && setShowPassword((prev) => !prev)}
                      sx={{ display: 'flex', cursor: loading ? 'default' : 'pointer', color: 'text.secondary' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 22 }} /> : <Visibility sx={{ fontSize: 22 }} />}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
            sx={{ py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': {
      borderColor: 'rgba(51, 95, 160, 0.38)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(91, 172, 195, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'secondary.main',
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'secondary.main',
  },
  '& .MuiInputBase-input': {
    color: 'text.primary',
  },
};
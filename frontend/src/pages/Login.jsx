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
  IconButton,
  Stack,
  alpha,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
      navigate('/patients');
    } catch {
      showToast('Invalid username or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background:
          `radial-gradient(circle at top left, ${alpha(theme.palette.secondary.main, 0.2)}, transparent 34%), radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.18)}, transparent 30%), linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.06)} 0%, ${alpha(theme.palette.secondary.light, 0.14)} 100%)`,
      })}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          width: '100%',
          maxWidth: 980,
          overflow: 'hidden',
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
          boxShadow: `0 24px 70px ${alpha(theme.palette.primary.dark, 0.22)}`,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(18px)',
        })}
      >
        <Box
          sx={(theme) => ({
            position: 'relative',
            p: { xs: 4, sm: 5, md: 6 },
            color: theme.palette.primary.contrastText,
            background:
              `linear-gradient(160deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: { md: 560 },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 'auto -80px -90px auto',
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: alpha(theme.palette.primary.contrastText, 0.12),
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: '24px auto auto -70px',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: alpha(theme.palette.primary.contrastText, 0.08),
            },
          })}
        >
          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 360 }}>
            <Typography
              component="h2"
              sx={{
                mt: 1,
                fontSize: { xs: 30, sm: 38, md: 44 },
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: -1,
                color: 'inherit',
              }}
            >
              CLDH Clinic
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ position: 'relative', zIndex: 1, mt: { xs: 5, md: 0 }, flexWrap: 'wrap' }}
          >
            {['Patient records', 'Fast check-in', 'Protected access'].map((item) => (
              <Box
                key={item}
                sx={(theme) => ({
                  px: 1.5,
                  py: 1,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.primary.contrastText, 0.12),
                  border: `1px solid ${alpha(theme.palette.primary.contrastText, 0.2)}`,
                  color: alpha(theme.palette.primary.contrastText, 0.94),
                  fontSize: 14,
                  fontWeight: 500,
                })}
              >
                {item}
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 4, sm: 5, md: 6 }, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
              Welcome back
            </Typography>
            <Typography color="primary" variant="h4" component="h2" sx={{ mt: 1, fontWeight: 700 }}>
              Login to continue
            </Typography>
            <Typography sx={{ mt: 1.2, color: 'text.secondary' }}>
              Use your clinic account to access your dashboard.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, mt: 4 }}
            >
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                fullWidth
                autoComplete="username"
                variant="outlined"
                sx={fieldSx}
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
                variant="outlined"
                sx={fieldSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={() => setShowPassword((prev) => !prev)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  mt: 1,
                  py: 1.4,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    backgroundColor: 'background.paper',
    transition: 'background-color 160ms ease, box-shadow 160ms ease',
    '& fieldset': {
      borderColor: 'rgba(51, 95, 160, 0.38)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(51, 95, 160, 0.56)',
    },
    '&.Mui-focused': {
      backgroundColor: 'background.paper',
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
  '& .MuiInputBase-input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
    WebkitTextFillColor: '#0f1e35',
    caretColor: '#0f1e35',
    borderRadius: 'inherit',
  },
};
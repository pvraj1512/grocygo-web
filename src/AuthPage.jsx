import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  Box, Typography, TextField, Button, Paper, Tabs, Tab,
  CircularProgress, Alert, InputAdornment, IconButton, Divider
} from '@mui/material';
import { useTheme } from './ThemeContext';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors, isDarkMode } = useTheme();

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onAuth();
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(userCred.user, { displayName: name });
      onAuth();
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@grocygo.com');
    setPassword('demo1234');
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, 'demo@grocygo.com', 'demo1234');
      onAuth();
    } catch (err) {
      // If demo account doesn't exist yet, try creating it
      try {
        const userCred = await createUserWithEmailAndPassword(auth, 'demo@grocygo.com', 'demo1234');
        await updateProfile(userCred.user, { displayName: 'Demo Chef' });
        onAuth();
      } catch (signupErr) {
        setError('Demo login error: ' + (signupErr.message || 'Please sign up with your email.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto', px: 2 }} className="animate-fade-in-up">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          bgcolor: colors.glassBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: colors.gradientPrimary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              mb: 1.5,
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <RestaurantMenuIcon fontSize="medium" />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text }}>
            Welcome to GrocyGo
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Your AI-Powered kitchen intelligence suite
          </Typography>
        </Box>

        {/* Tab Switcher */}
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setError(''); }}
          variant="fullWidth"
          sx={{
            mb: 3,
            bgcolor: colors.hover,
            borderRadius: '12px',
            p: 0.5,
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: '100%',
              borderRadius: '10px',
              bgcolor: colors.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 0,
            },
            '& .MuiTab-root': {
              minHeight: 38,
              zIndex: 1,
              fontWeight: 700,
              fontSize: '0.9rem',
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: colors.text,
              },
            },
          }}
        >
          <Tab label="Log In" disableRipple />
          <Tab label="Create Account" disableRipple />
        </Tabs>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        {tab === 0 ? (
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                background: colors.gradientPrimary,
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>
          </Box>
        ) : (
          /* Sign Up Form */
          <Box component="form" onSubmit={handleSignup}>
            <TextField
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                background: colors.gradientPrimary,
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>
        )}

        {/* Demo Login Quick Fill */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Divider sx={{ mb: 2, borderColor: colors.divider }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary, px: 1 }}>
              OR TRY INSTANTLY
            </Typography>
          </Divider>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AutoAwesomeIcon sx={{ color: colors.accent }} />}
            onClick={handleDemoLogin}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              py: 1.2,
              borderColor: colors.border,
              color: colors.text,
              '&:hover': {
                borderColor: colors.accent,
                bgcolor: colors.accentLight,
              },
            }}
          >
            Explore with Demo Account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

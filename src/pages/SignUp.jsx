import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 140, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: 'rgba(0, 140, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgb(0, 140, 255)',
    },
    '& input': {
      color: 'black',
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px white inset',
        WebkitTextFillColor: 'black',
        caretColor: 'black',
      },
      '&:-webkit-autofill:hover': {
        WebkitBoxShadow: '0 0 0 100px white inset',
      },
      '&:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 100px white inset',
      },
      '&:-webkit-autofill:active': {
        WebkitBoxShadow: '0 0 0 100px white inset',
      },
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'rgb(0, 140, 255)',
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: 'rgba(0, 0, 0, 0.38)',
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, rgb(0, 140, 255) 30%, rgb(0, 162, 255) 90%)',
  padding: '12px',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': {
    background: 'linear-gradient(45deg, rgb(0, 120, 235) 30%, rgb(0, 142, 235) 90%)',
  },
  '&.Mui-disabled': {
    background: 'rgba(0, 140, 255, 0.3)',
    color: 'white',
  },
}));

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate();
  const { signup, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    try {
      setLoading(true);
      await signup(email, password, name);
      // Navigation is handled by useEffect
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledPaper elevation={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: 'rgb(0, 140, 255)',
              mb: 3,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Create Account
          </Typography>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '8px',
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              '& .MuiTextField-root': { mb: 2.5 },
            }}
          >
            <StyledTextField
              label="Full Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <StyledTextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <StyledTextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              label="Confirm Password"
              type={showPasswordConfirm ? 'text' : 'password'}
              fullWidth
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      edge="end"
                    >
                      {showPasswordConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledButton
              type="submit"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </StyledButton>
          </Box>

          <Typography 
            align="center" 
            sx={{ 
              mt: 3,
              color: 'rgba(0, 0, 0, 0.7)',
              '& a': {
                color: 'rgb(0, 140, 255)',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
            }}
          >
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </StyledPaper>
      </motion.div>
    </Container>
  );
}

export default SignUp; 
import { useState } from 'react';
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
import LoginIcon from '@mui/icons-material/Login';

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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please check your credentials.');
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
            Welcome Back
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
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
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
            
            <StyledButton
              type="submit"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
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
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </StyledPaper>
      </motion.div>
    </Container>
  );
}

export default Login; 
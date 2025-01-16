import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
} from '@mui/material';

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Welcome to StudyBuddy
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Find your perfect study partner and learn together
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {!currentUser ? (
            <>
              <Button variant="contained" size="large" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
                Login
              </Button>
            </>
          ) : (
            <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Find Experts
            </Typography>
            <Typography variant="body1">
              Connect with experts in your field of interest
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Share Knowledge
            </Typography>
            <Typography variant="body1">
              Collaborate and learn from peers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              AI Matching
            </Typography>
            <Typography variant="body1">
              Get matched with the perfect study partners
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home; 
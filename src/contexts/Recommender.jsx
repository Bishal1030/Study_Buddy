import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  Paper,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Link as LinkIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Styled components matching the app theme
const WelcomeCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  }
}));

const SearchCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 98, 255, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(0, 98, 255, 0.15)',
  }
}));

const CourseCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0, 98, 255, 0.06)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(0, 98, 255, 0.15)',
    background: '#f8f9fa',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
  borderRadius: '12px',
  padding: '12px 32px',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #0051d4 20%, #00b3e6 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 98, 255, 0.3)',
  }
}));

const Recommender = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/recommend/', {
        query,
        category,
      });
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Welcome Section */}
          <WelcomeCard sx={{ mb: 4 }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography 
                  variant="h3" 
                  style={{
                    fontWeight: 800,
                    fontSize: '2.5rem',
                    marginBottom: '16px',
                    color: 'white',
                  }}
                >
                  Course Recommender ✨
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography 
                  variant="h6" 
                  style={{
                    opacity: 0.9,
                    fontWeight: 400,
                    marginBottom: '16px',
                    color: 'white',
                  }}
                >
                  Discover personalized course recommendations based on your interests and goals
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<AutoAwesomeIcon />} 
                    label="AI-Powered" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }} 
                  />
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label="Personalized" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }} 
                  />
                  <Chip 
                    icon={<SchoolIcon />} 
                    label="Expert Curated" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }} 
                  />
                </Box>
              </motion.div>
            </Box>
          </WelcomeCard>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <SearchCard sx={{ p: 4, mb: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="What would you like to learn?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Python programming, Web development, Data science..."
                      variant="outlined"
                      required
                      InputProps={{
                        startAdornment: (
                          <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
                        ),
                        style: { color: '#333' }
                      }}
                      InputLabelProps={{
                        style: { color: '#666' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: '#ddd',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0062ff',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0062ff',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#666',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0062ff',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Category (Optional)"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Computer Science, Business..."
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <SchoolIcon sx={{ color: 'primary.main', mr: 1 }} />
                        ),
                        style: { color: '#333' }
                      }}
                      InputLabelProps={{
                        style: { color: '#666' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: '#ddd',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0062ff',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0062ff',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#666',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0062ff',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <GradientButton
                      fullWidth
                      type="submit"
                      disabled={loading}
                      sx={{ height: '56px' }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Find Courses'
                      )}
                    </GradientButton>
                  </Grid>
                </Grid>
              </form>
            </SearchCard>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Results Section */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h5" 
                  style={{ 
                    fontWeight: 600, 
                    marginBottom: '8px',
                    color: '#333'
                  }}
                >
                  Recommended Courses ({recommendations.length})
                </Typography>
                <Typography 
                  variant="body2" 
                  style={{ color: '#666' }}
                >
                  Based on your search for "{query}"
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {console.log('Current recommendations state:', recommendations)}
                {recommendations.map((rec, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <CourseCard>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <SchoolIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                            <Typography 
                              variant="h6" 
                              style={{
                                fontWeight: 600,
                                lineHeight: 1.3,
                                flex: 1,
                                color: '#333'
                              }}
                            >
                              {rec.title}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Tooltip title="View Course">
                              <IconButton
                                component="a"
                                href={rec.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #0051d4 20%, #00b3e6 90%)',
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <LinkIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Chip 
                              label="View Course" 
                              size="small"
                              component="a"
                              href={rec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: 'rgba(0, 98, 255, 0.1)',
                                color: '#0062ff',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textDecoration: 'none'
                              }}
                            />
                          </Box>
                        </CardContent>
                      </CourseCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && recommendations.length === 0 && query && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                style={{ 
                  padding: '32px', 
                  textAlign: 'center',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(0, 98, 255, 0.06)'
                }}
              >
                <SchoolIcon style={{ fontSize: 64, color: '#999', marginBottom: '16px' }} />
                <Typography 
                  variant="h6" 
                  style={{ 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#333'
                  }}
                >
                  No courses found
                </Typography>
                <Typography 
                  variant="body2" 
                  style={{ color: '#666' }}
                >
                  Try adjusting your search terms or category to find more courses.
                </Typography>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default Recommender;
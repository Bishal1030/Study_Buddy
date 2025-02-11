import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Custom styled components
const WelcomeText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(45deg,rgb(0, 140, 255) 30%,rgb(0, 162, 255) 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 20px rgba(144, 202, 249, 0.25)', // Adds a glow effect
}));

const SubText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Roboto', sans-serif",
  color: 'rgb(0, 140, 255)', // Lighter blue for better visibility
  marginBottom: theme.spacing(4),
}));

function Home() {
  const navigate = useNavigate();

  const handleFindBuddies = () => {
    navigate('/dashboard');
  };

  const handleShareResources = () => {
    navigate('/resources');
  };

  // Add animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ 
          mt: 8, 
          mb: 4, 
          textAlign: 'center',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          >
            <WelcomeText variant="h2" gutterBottom>
              Welcome to Study Buddy
            </WelcomeText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
          >
            <SubText variant="h5" gutterBottom>
              Connect, Share, and Learn Together
            </SubText>
          </motion.div>

          <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  onClick={handleFindBuddies}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    backgroundColor: 'rgba(25, 118, 210, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(144, 202, 249, 0.2)',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      backgroundColor: 'rgba(25, 118, 210, 0.25)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <CardContent>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                    >
                      <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#ffffff' }}>
                        Find Buddies
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        Connect with fellow students who share your interests and goals.
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  onClick={handleShareResources}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    backgroundColor: 'rgba(25, 118, 210, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(144, 202, 249, 0.2)',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      backgroundColor: 'rgba(25, 118, 210, 0.25)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <CardContent>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                    >
                      <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#ffffff' }}>
                        Share Resources
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        Share and access study materials, notes, and helpful resources.
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Container>
  );
}

export default Home; 
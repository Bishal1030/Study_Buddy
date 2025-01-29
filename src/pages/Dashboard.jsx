import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Drawer,
  InputAdornment,
  Chip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import ChatWindow from '../components/Chat/ChatWindow';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedCard = ({ children, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

function Dashboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          skills: doc.data().skills || [],
        }))
        .filter(user => user.id !== currentUser.uid);
      
      console.log('Fetched users with skills:', usersData);
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.skills?.join(' ').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.expertise?.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(253, 250, 210, 0.76) 0%, rgba(0, 230, 118, 0.12) 100%)',
            backdropFilter: 'blur(10px)',
            // border: '1px solid rgba(144, 202, 249, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              // boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: '2.5rem', md: '3rem' },
                color: '#1565c0',
                mb: 1,
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              Welcome back,
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: "'Dancing Script', cursive",
                fontSize: { xs: '3rem', md: '3.8rem' },
                background: 'linear-gradient(45deg, #2196F3 30%, #00E676 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                letterSpacing: '1px',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {currentUser?.name || 'Study Buddy'}!
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: "'Montserrat', sans-serif",
                color: '#455a64',
                fontWeight: 500,
                letterSpacing: '0.5px',
                lineHeight: 1.5,
              }}
            >
              Ready to connect and learn together?
            </Typography>
          </Box>
        </Paper>

        {/* Updated input field with darker styling */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(30, 36, 50, 0.95)',
            borderRadius: '20px',
            border: '1px solid rgba(144, 202, 249, 0.2)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 24px rgba(33, 150, 243, 0.2)',
              background: 'rgba(30, 36, 50, 0.98)',
            }
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ 
                    color: '#90caf9',
                    fontSize: '1.5rem',
                    ml: 1 
                  }} />
                </InputAdornment>
              ),
              sx: {
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.1rem',
                color: '#ffffff',
                '& input::placeholder': {
                  color: '#90caf9',
                  opacity: 0.7,
                  fontWeight: 500,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(144, 202, 249, 0.3)',
                  borderWidth: '2px',
                  transition: 'all 0.3s ease',
                  borderRadius: '15px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#90caf9',
                  borderWidth: '2px',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#90caf9',
                  borderWidth: '2px',
                },
                borderRadius: '15px',
                backgroundColor: 'rgba(25, 32, 44, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 32, 44, 1)',
                },
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                padding: '3px',
              }
            }}
            sx={{
              '& .MuiInputBase-input': {
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '1.1rem',
                padding: '14px 16px',
                '&::placeholder': {
                  opacity: 1,
                }
              },
              '& .MuiInputLabel-root': {
                color: '#90caf9',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#90caf9',
              }
            }}
          />
        </Paper>
      </motion.div>

      {/* Users List */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Study Buddies
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
                      }
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        p: 3,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        '&:last-child': { 
                          pb: 3
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        gap: 2
                      }}>
                        <Avatar
                          src={user.photoURL}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '2px solid #90caf9',
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
                          }}
                        >
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontFamily: "'Montserrat', sans-serif",
                              fontWeight: 600,
                              color: '#1976d2',
                              mb: 0.5
                            }}
                          >
                            {user.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontSize: '0.875rem'
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: 1,
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 600,
                            color: '#455a64'
                          }}
                        >
                          Expertise & Skills
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 1 
                        }}>
                          {/* Expertise Levels */}
                          {user.expert && (
                            <Chip 
                              label={`Expert in: ${user.expert}`}
                              color="success"
                              size="small"
                              sx={{ 
                                alignSelf: 'flex-start',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                color: '#2e7d32',
                                fontWeight: 500,
                              }}
                            />
                          )}
                          {user.good && (
                            <Chip 
                              label={`Good at: ${user.good}`}
                              color="primary"
                              size="small"
                              sx={{ 
                                alignSelf: 'flex-start',
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                color: '#1976d2',
                                fontWeight: 500,
                              }}
                            />
                          )}
                          
                          {/* Skills */}
                          {Array.isArray(user.skills) && user.skills.length > 0 && (
                            <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1,
                              mt: 1 
                            }}>
                              {user.skills.map((skill, i) => (
                                <Chip
                                  key={i}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                    color: '#1976d2',
                                    borderRadius: '8px',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        startIcon={<MessageIcon />}
                        onClick={() => handleStartChat(user)}
                        sx={{
                          mt: 2,
                          textTransform: 'none',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 600,
                          borderRadius: '8px',
                          background: 'linear-gradient(45deg, #1976d2 30%, #2196F3 90%)',
                          boxShadow: '0 3px 12px rgba(33, 150, 243, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                            boxShadow: '0 4px 16px rgba(33, 150, 243, 0.4)',
                          }
                        }}
                      >
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: '#666'
                }}>
                  <Typography variant="h6">No users found</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            p: 2,
          },
        }}
      >
        {selectedUser && (
          <ChatWindow
            recipientId={selectedUser.id}
            recipientName={selectedUser.name}
          />
        )}
      </Drawer>
    </Container>
  );
}

export default Dashboard; 
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
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
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SchoolIcon from '@mui/icons-material/School';
import ChatWindow from '../components/Chat/ChatWindow';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Modern Welcome Section
const WelcomeSection = ({ userName }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#1A237E',
              mb: 1,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 80,
                height: 4,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #5C6BC0 0%, #3F51B5 100%)',
              }
            }}
          >
            Hey {userName || 'Study Buddy'}!
          </Typography>
          <Typography 
            variant="subtitle1"
            sx={{ 
              color: '#000000',
              fontSize: '1.1rem',
              mt: 2,
            }}
          >
            Find your perfect study partner and level up your skills together.
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

// Modern Search Bar
const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <Box 
    sx={{ 
      mb: 5, 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      gap: 2,
      width: '100%',
    }}
  >
    <TextField
      placeholder="Find study partners by name, skills or subject..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#' }} />
          </InputAdornment>
        ),
        sx: {
          height: '50px',
          borderRadius: '12px',
          backgroundColor: '#000000',
          border: 'none',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E0E0E0',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3F51B5',
          },
        }
      }}
    />
  </Box>
);

// Modern User Card
const UserCard = ({ user, handleStartChat, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        ease: "easeOut"
      }}
    >
      <Card
        sx={{
          height: '40vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          border: '1px solid #F0F0F0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(63, 81, 181, 0.15)',
            '& .card-header': {
              backgroundColor: '#F5F7FF',
            }
          }
        }}
      >
        <Box 
          className="card-header"
          sx={{ 
            p: 3, 
            borderBottom: '1px solid #F5F7FA',
            backgroundColor: 'white',
            transition: 'background-color 0.25s ease',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2
          }}>
            <Avatar
              src={user.photoURL}
              sx={{
                width: 60,
                height: 60,
                backgroundColor: '#EFEFF7',
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.12)',
              }}
            >
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  color: '#212121',
                }}
              >
                {user.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: '#6C757D',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <SchoolIcon sx={{ fontSize: '1rem' }} />
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 3, pt: 2, flex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography 
              sx={{ 
                fontSize: '0.9rem',
                color: '#fff',
                fontWeight: 600,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Skills & Expertise
            </Typography>
            
            {/* Expertise Levels */}
            <Box sx={{ mb: 2 }}>
              {user.expert ? (
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Chip 
                    label="EXPERT"
                    size="small"
                    sx={{ 
                      backgroundColor: '#EDE7F6',
                      color: '#5E35B1',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: '22px',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: '#212121',
                    }}
                  >
                    {user.expert}
                  </Typography>
                </Box>
              ) : null}
              
              {user.good ? (
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Chip 
                    label="PROFICIENT"
                    size="small"
                    sx={{ 
                      backgroundColor: '#E8F5E9',
                      color: '#2E7D32',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: '22px',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: '#212121',
                    }}
                  >
                    {user.good}
                  </Typography>
                </Box>
              ) : null}
              
              {!user.expert && !user.good && (
                <Typography 
                  sx={{ 
                    fontSize: '0.9rem',
                    color: '#e7e7e7',
                    fontStyle: 'italic',
                  }}
                >
                  No expertise specified yet
                </Typography>
              )}
            </Box>
              
            {/* Skills */}
            {Array.isArray(user.skills) && user.skills.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
              }}>
                {user.skills.map((skill, i) => (
                  <Chip
                    key={i}
                    label={skill}
                    size="small"
                    sx={{
                      backgroundColor: '#F5F7FA',
                      color: '#455A64',
                      borderRadius: '6px',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      '&:hover': {
                        backgroundColor: '#E8EAF6',
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
        
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            variant="contained"
            startIcon={<MessageIcon />}
            onClick={() => handleStartChat(user)}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '0.95rem',
              backgroundColor: '#3F51B5',
              '&:hover': {
                backgroundColor: '#303F9F',
                boxShadow: '0 6px 12px rgba(63, 81, 181, 0.2)',
              },
            }}
          >
            Start Study Session
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

// Recent Contacts Component
const RecentContacts = ({ recentChats, handleStartChat }) => {
  if (recentChats.length === 0) return null;
  
  return (
    <Box sx={{ mb: 5 }}>
      <Typography 
        sx={{ 
          fontSize: '1rem',
          fontWeight: 600,
          mb: 2,
          color: '#3F51B5',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <MessageIcon sx={{ fontSize: '1.2rem' }} />
        Recent Study Partners
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        {recentChats.map((user) => (
          <Box
            key={user.id}
            onClick={() => handleStartChat(user)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            <Avatar
              src={user.photoURL}
              sx={{
                width: 56,
                height: 56,
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {user.name?.split(' ')[0] || 'User'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Empty Search Results
const EmptyState = () => (
  <Box 
    sx={{ 
      textAlign: 'center', 
      py: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box 
      sx={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        backgroundColor: '#F5F7FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
      }}
    >
      <SearchIcon sx={{ fontSize: 40, color: '#9E9E9E' }} />
    </Box>
    <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600 }}>
      No study partners found
    </Typography>
    <Typography variant="body1" sx={{ color: '#757575', maxWidth: 400 }}>
      Try adjusting your search terms or explore other subjects to find the perfect study buddy.
    </Typography>
  </Box>
);

function Dashboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState([]);

  // Fetch users data
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
      
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Fetch recent chats
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => doc.data());
      const uniqueUsers = new Set();
      const recentUsers = [];

      chatsData.forEach(chat => {
        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        if (otherUserId && !uniqueUsers.has(otherUserId)) {
          uniqueUsers.add(otherUserId);
          const user = users.find(u => u.id === otherUserId);
          if (user) {
            recentUsers.push(user);
          }
        }
      });

      setRecentChats(recentUsers.slice(0, 5)); // Limit to 5 recent chats
    });

    return () => unsubscribe();
  }, [currentUser?.uid, users]);

  // Memoize filtered users to improve performance
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.expertise?.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase())) || false) ||
      (user.good?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.expert?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );
  }, [users, searchQuery]);

  const handleStartChat = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8, backgroundColor: 'white' }}>
      {/* Welcome Section */}
      <WelcomeSection userName={currentUser?.name} />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Recent Contacts */}
      <RecentContacts recentChats={recentChats} handleStartChat={handleStartChat} />

      {/* Users List */}
      <Box>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: '#212121',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            Available Study Partners
            {!loading && filteredUsers.length > 0 && (
              <Chip 
                label={filteredUsers.length} 
                size="small" 
                sx={{ 
                  fontSize: '0.75rem', 
                  height: '22px',
                  backgroundColor: '#EDE7F6',
                  color: '#5E35B1',
                  fontWeight: 600,
                }} 
              />
            )}
          </Typography>
          
          <Button
            variant="text"
            sx={{
              textTransform: 'none',
              color: '#3F51B5',
              fontWeight: 500,
            }}
          >
            View All
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 8 
          }}>
            <CircularProgress size={40} sx={{ color: '#3F51B5' }} />
          </Box>
        ) : (
          <>
            {filteredUsers.length > 0 ? (
              <Grid container spacing={3}>
                {filteredUsers.map((user, index) => (
                  <Grid item xs={12} sm={6} md={4} key={user.id}>
                    <UserCard 
                      user={user} 
                      handleStartChat={handleStartChat} 
                      index={index}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyState />
            )}
          </>
        )}
      </Box>

      {/* Chat Drawer */}
      <Drawer
        anchor="bottom"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            height: 'auto',
            maxHeight: '80vh',
            width: '400px',
            p: 2,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            left: 'auto',
            right: '32px',
            bottom: '32px',
            position: 'fixed',
            borderRadius: '12px',
          },
        }}
      >
        {selectedUser && (
          <ChatWindow
            recipientId={selectedUser.id}
            recipientName={selectedUser.name}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </Drawer>
    </Container>
  );
}

export default Dashboard;
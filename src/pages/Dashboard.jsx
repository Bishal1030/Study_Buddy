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
  Stack,
  IconButton,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import VideocamIcon from '@mui/icons-material/Videocam';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatWindow from '../components/Chat/ChatWindow';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Ultra Modern Welcome Section with Glassmorphism
const WelcomeSection = ({ userName }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Box 
        sx={{ 
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
          p: 4,
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 2,
                    background: 'linear-gradient(45deg, #ffffff, #f8f9ff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  Welcome back, {userName?.split(' ')[0] || 'Scholar'}! ✨
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  Ready to connect with brilliant minds and accelerate your learning journey?
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <Chip 
                    icon={<AutoAwesomeIcon />}
                    label="AI-Powered Matching" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600,
                    }}
                  />
                  <Chip 
                    icon={<TrendingUpIcon />}
                    label="Skill Growth Tracking" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </motion.div>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    margin: { xs: '0 auto', md: '0 0 0 auto' },
                  }}
                >
                  🚀
                </Box>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

// Futuristic Search Bar
const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    <Box 
      sx={{ 
        mb: 6,
        position: 'relative',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '20px',
          p: 1,
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <TextField
          placeholder="Discover amazing study partners by skills, expertise, or interests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#0062ff', fontSize: '1.5rem' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton sx={{ color: '#0062ff' }}>
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              height: '64px',
              color: '#3b3b3b',
              borderRadius: '16px',
              backgroundColor: 'transparent',
              fontSize: '1.1rem',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: '2px solid #0062ff',
              },
            }
          }}
        />
      </Paper>
    </Box>
  </motion.div>
);

// Next-Gen User Card
const UserCard = ({ user, handleStartChat, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: -15 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        sx={{
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          background: isHovered 
            ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(145deg, #fefefe 0%, #f1f5f9 100%)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: isHovered 
            ? '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1)'
            : '0 10px 25px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #006288, #0062ff 0%, #00c6ff 100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }
        }}
      >
        {/* Header with Avatar */}
        <Box 
          sx={{ 
            p: 3,
            pb: 2,
            position: 'relative',
            background: isHovered ? 'rgba(99, 102, 241, 0.02)' : 'transparent',
            transition: 'background 0.3s ease',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user.photoURL}
                  sx={{
                    color: 'white',
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                    border: '3px solid white',
                    boxShadow: '0 8px 32px rgba(137, 190, 245, 0.3)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '3px solid white',
                  }}
                />
              </Box>
              
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    color: '#1e293b',
                    mb: 0.5,
                  }}
                >
                  {user.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: '#0062ff',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: '1rem' }} />
                  {user.email}
                </Typography>
              </Box>
            </Box>
            
            <IconButton 
              size="small"
              sx={{ 
                color: '#64748b',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Skills & Expertise */}
        <CardContent sx={{ p: 3, pt: 1, flex: 1 }}>
          <Typography 
            sx={{ 
              fontSize: '0.85rem',
              color: '#0062ff',
              fontWeight: 700,
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <StarIcon sx={{ fontSize: '1rem' }} />
            Expertise & Skills
          </Typography>
          
          {/* Expertise Levels */}
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {user.expert && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label="🏆 EXPERT"
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: '28px',
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
                <Typography sx={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                  {user.expert}
                </Typography>
              </Box>
            )}
            
            {user.good && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label="⭐ SKILLED"
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: '28px',
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
                <Typography sx={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                  {user.good}
                </Typography>
              </Box>
            )}
          </Stack>
              
          {/* Skills Tags */}
          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              mt: 2,
            }}>
              {user.skills.slice(0, 4).map((skill, i) => (
                <Chip
                  key={i}
                  label={skill}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#0062ff',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
              {user.skills.length > 4 && (
                <Chip
                  label={`+${user.skills.length - 4}`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    color: '#64748b',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                />
              )}
            </Box>
          )}
          
          {!user.expert && !user.good && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 2,
              opacity: 0.6,
            }}>
              <Typography sx={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                🌱 Growing their expertise
              </Typography>
            </Box>
          )}
        </CardContent>
        
        {/* Action Buttons */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<MessageIcon />}
              onClick={() => handleStartChat(user)}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '16px',
                padding: '12px 24px',
                fontSize: '0.95rem',
                background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Connect Now
            </Button>
          </Stack>
        </Box>
      </Card>
    </motion.div>
  );
};

// Enhanced Recent Contacts
const RecentContacts = ({ recentChats, handleStartChat }) => {
  if (recentChats.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography 
            sx={{ 
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            💬 Recent Study Sessions
          </Typography>
          
          <Button
            variant="text"
            endIcon={<PersonAddIcon />}
            sx={{
              textTransform: 'none',
              color: '#0062ff',
              fontWeight: 600,
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              }
            }}
          >
            View All
          </Button>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#0062ff',
            borderRadius: 3,
          },
        }}>
          {recentChats.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Box
                onClick={() => handleStartChat(user)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  p: 2,
                  borderRadius: '20px',
                  minWidth: 100,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    transform: 'translateY(-8px)',
                  }
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid white',
                      }}
                    />
                  }
                >
                  <Avatar
                    src={user.photoURL}
                    sx={{
                      width: 72,
                      height: 72,
                      background: 'linear-gradient(135deg, #0062ff 0%, #764ba2 100%)',
                      border: '3px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </Avatar>
                </Badge>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 0.5,
                  }}>
                    {user.name?.split(' ')[0] || 'User'}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.75rem', 
                    color: '#0062ff',
                    fontWeight: 600,
                  }}>
                    Active now
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

// Modern Empty State
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Box 
        sx={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          fontSize: '3rem',
        }}
      >
        🔍
      </Box>
      
      <Box>
        <Typography variant="h5" sx={{ 
          color: '#1e293b', 
          fontWeight: 800,
          mb: 2,
        }}>
          No study partners found
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#64748b', 
          maxWidth: 400,
          fontSize: '1.1rem',
          lineHeight: 1.6,
        }}>
          Try exploring different skills or subjects to discover amazing study buddies waiting to connect!
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        sx={{
          mt: 2,
          borderRadius: '16px',
          textTransform: 'none',
          fontWeight: 700,
          px: 4,
          py: 2,
          background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
        }}
      >
        Explore All Partners
      </Button>
    </Box>
  </motion.div>
);

// Main Dashboard Component
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
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
            mb: 4
          }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 1,
                }}
              >
                🌟 Discover Study Partners
                {!loading && filteredUsers.length > 0 && (
                  <Chip 
                    label={`${filteredUsers.length} Available`} 
                    size="small" 
                    sx={{ 
                      fontSize: '0.8rem', 
                      height: '28px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 700,
                    }} 
                  />
                )}
              </Typography>
              <Typography 
                variant="body1"
                sx={{
                  color: '#64748b',
                  fontSize: '1.1rem',
                }}
              >
                Connect with brilliant minds and accelerate your learning journey
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <IconButton
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#0062ff',
                  borderRadius: '12px',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  }
                }}
              >
                <FilterListIcon />
              </IconButton>
              
              <IconButton
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#0062ff',
                  borderRadius: '12px',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  }
                }}
              >
                <BookmarkIcon />
              </IconButton>
            </Stack>
          </Box>
          
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              py: 12,
              gap: 3,
            }}>
              <Box sx={{ position: 'relative' }}>
                <CircularProgress 
                  size={60} 
                  sx={{ 
                    color: '#0062ff',
                    animationDuration: '1.5s',
                  }} 
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.5rem',
                  }}
                >
                  🚀
                </Box>
              </Box>
              <Typography sx={{ 
                color: '#64748b', 
                fontSize: '1.1rem',
                fontWeight: 600,
              }}>
                Finding amazing study partners for you...
              </Typography>
            </Box>
          ) : (
            <>
              {filteredUsers.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Grid container spacing={4}>
                    {filteredUsers.map((user, index) => (
                      <Grid item xs={12} sm={6} lg={4} key={user.id}>
                        <UserCard 
                          user={user} 
                          handleStartChat={handleStartChat} 
                          index={index}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              ) : (
                <EmptyState />
              )}
            </>
          )}
        </Box>

        {/* Enhanced Chat Drawer */}
        <Drawer
          anchor="right"
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: 450 },
              height: '100vh',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: { xs: 0, sm: '24px 0 0 24px' },
              border: 'none',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          }}>
            {/* Chat Header */}
            <Box 
              sx={{ 
                p: 3,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedUser?.photoURL}
                  sx={{
                    width: 48,
                    height: 48,
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {selectedUser?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedUser?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Online now • Ready to study
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setIsChatOpen(false)}
                  sx={{ color: 'white' }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>✕</Box>
                </IconButton>
              </Box>
            </Box>
            
            {/* Chat Content */}
            <Box sx={{ flex: 1 }}>
              {selectedUser && (
                <ChatWindow
                  recipientId={selectedUser.id}
                  recipientName={selectedUser.name}
                  onClose={() => setIsChatOpen(false)}
                />
              )}
            </Box>
          </Box>
        </Drawer>
      </Container>
    </Box>
  );
}

export default Dashboard;
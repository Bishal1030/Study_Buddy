import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Button,
  Avatar,
  Chip,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { 
  SchoolOutlined, 
  GroupOutlined, 
  MenuBookOutlined, 
  EmojiEventsOutlined,
  TrendingUp
} from '@mui/icons-material';
import homejpg from "../assets/home.jpg"

// Custom styled components
const WelcomeText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 25px rgba(77, 171, 245, 0.35)',
}));

const SubText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Roboto', sans-serif",
  color: '#0062ff',
  marginBottom: theme.spacing(2),
  fontWeight: 400,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(144, 202, 249, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 98, 255, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(0, 98, 255, 0.15)',
    background: 'rgba(255, 255, 255, 0.1)',
  }
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(144, 202, 249, 0.15)',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0, 98, 255, 0.06)',
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-15px',
    left: '20px',
    width: '30px',
    height: '30px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(144, 202, 249, 0.15)',
    transform: 'rotate(45deg)',
    zIndex: -1,
  }
}));

const StatsCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  background: 'rgba(0, 98, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(0, 98, 255, 0.12)',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0062ff 30%, #00c6ff 90%)',
  borderRadius: '30px',
  border: 0,
  color: 'white',
  padding: '12px 24px',
  boxShadow: '0 3px 15px rgba(0, 98, 255, 0.3)',
  fontWeight: 600,
  letterSpacing: '0.5px',
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0, 98, 255, 0.4)',
    transform: 'translateY(-2px)',
  }
}));

const SubjectChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  background: 'rgba(0, 98, 255, 0.1)',
  color: '#0062ff',
  borderRadius: '30px',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(0, 98, 255, 0.2)',
  }
}));

function Home() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [stats, setStats] = useState({ students: 0, sessions: 0, resources: 0 });
  
  useEffect(() => {
    // Animate counter for stats
    const targetStats = { students: 5200, sessions: 12500, resources: 8700 };
    const duration = 2000; // ms
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setStats({
        students: Math.floor(progress * targetStats.students),
        sessions: Math.floor(progress * targetStats.sessions),
        resources: Math.floor(progress * targetStats.resources)
      });
      
      if (frame === totalFrames) {
        clearInterval(timer);
      }
    }, frameDuration);
    
    return () => clearInterval(timer);
  }, []);

  const handleFindBuddies = () => {
    navigate('/dashboard');
  };

  const handleShareResources = () => {
    navigate('/resources');
  };

  const testimonials = [
    {
      name: "Bishal Shahi",
      avatar: "https://randomuser.me/api/portraits/men/19.jpg",
      role: "Cyber Security",
      content: "Study Buddy completely transformed my learning experience. I connected with two other CS majors and we've been acing our algorithms course together! The resource sharing is incredible."
    },
    {
      name: "Sujita Chand",
      avatar: "https://randomuser.me/api/portraits/women/75.jpg",
      role: "Data Analytics",
      content: "The resource sharing feature is incredible. I found study guides that helped me improve my organic chemistry grade from a C to an A-. This platform is a game-changer."
    },
    {
      name: "Shivoo singh",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      role: "Machine Learning",
      content: "I was struggling with statistics until I found a study group through this platform. We meet three times a week virtually, and I'm finally understanding the concepts."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const floatingAnimation = {
    y: ['-10px', '10px'],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e8f0ff 100%)',
      minHeight: '100vh',
      pb: 10
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box sx={{ 
            pt: 12, 
            pb: 8, 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}>
            <Box sx={{ 
              width: isMobile ? '100%' : '55%',
              mb: isMobile ? 5 : 0
            }}>
              <motion.div variants={itemVariants}>
                <Chip 
                  label="Supercharge Your Learning" 
                  sx={{ 
                    mb: 2, 
                    background: 'rgba(0, 98, 255, 0.1)', 
                    color: '#0062ff',
                    fontWeight: 600,
                    py: 0.8,
                    px: 1
                  }} 
                  icon={<TrendingUp style={{ color: '#0062ff' }} />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <WelcomeText variant={isMobile ? "h3" : "h2"} gutterBottom>
                  Elevate Your Academic Journey with Study Buddy
                </WelcomeText>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <SubText variant="h6" sx={{ color: '#546e7a', mb: 3, maxWidth: '90%' }}>
                  Find the perfect study companions, share valuable resources, and achieve your academic goals together.
                </SubText>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                  <GradientButton 
                    size="large" 
                    onClick={handleFindBuddies}
                    startIcon={<GroupOutlined />}
                  >
                    Find Study Buddies
                  </GradientButton>
                  
                  <Button 
                    size="large" 
                    variant="outlined"
                    onClick={handleShareResources}
                    sx={{ 
                      borderRadius: '30px',
                      borderColor: '#0062ff',
                      color: '#0062ff',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#0062ff',
                        background: 'rgba(0, 98, 255, 0.05)',
                      }
                    }}
                    startIcon={<MenuBookOutlined />}
                  >
                    Explore Resources
                  </Button>
                </Box>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', mt: 5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: '#546e7a', mr: 1, mb: 1, mt:0.5 }}>
                    Popular subjects:
                  </Typography>
                  <SubjectChip label="Cyber Security" size="small" />
                  <SubjectChip label="Web Development" size="small" />
                  <SubjectChip label="Ui/Ux Designing" size="small" />
                  <SubjectChip label="Machine Learning" size="small" />
                </Box>
              </motion.div>
            </Box>
            
            <Box sx={{ 
              width: isMobile ? '100%' : '45%',
              position: 'relative',
              height: isMobile ? '300px' : '400px',
            }}>
              <motion.div
                animate={floatingAnimation}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0, 98, 255, 0.1)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(0, 98, 255, 0.12)',
                }}
              >
                <img 
                  src={homejpg}
                  alt="Students studying together" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    width: '100%',
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(245, 247, 255, 1), rgba(245, 247, 255, 0))',
                  }}
                />
              </motion.div>
            </Box>
          </Box>
        </motion.div>
        
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Grid container spacing={3} sx={{ mb: 10 }}>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant="h3" sx={{ color: '#0062ff', fontWeight: 700 }}>
                  {stats.students.toLocaleString()}+
                </Typography>
                <Typography variant="body1" sx={{ color: '#546e7a' }}>
                  Active Students
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant="h3" sx={{ color: '#0062ff', fontWeight: 700 }}>
                  {stats.sessions.toLocaleString()}+
                </Typography>
                <Typography variant="body1" sx={{ color: '#546e7a' }}>
                  Study Sessions
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant="h3" sx={{ color: '#0062ff', fontWeight: 700 }}>
                  {stats.resources.toLocaleString()}+
                </Typography>
                <Typography variant="body1" sx={{ color: '#546e7a' }}>
                  Shared Resources
                </Typography>
              </StatsCard>
            </Grid>
          </Grid>
        </motion.div>

        {/* Features Section */}
        <Box sx={{ mb: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: '#0d1117',
                mb: 1
              }}
            >
              Supercharge Your Study Experience
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                color: '#546e7a',
                mb: 6,
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Discover a suite of powerful features designed to transform how you learn and collaborate with peers
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FeatureCard>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      background: 'rgba(0, 98, 255, 0.1)',
                      color: '#0062ff',
                      mr: 2
                    }}>
                      <GroupOutlined fontSize="large" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1117' }}>
                      Smart Matching
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#546e7a' }}>
                    Our algorithm connects you with study partners who match your learning style, goals, and schedule for maximum compatibility.
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FeatureCard>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      background: 'rgba(0, 98, 255, 0.1)',
                      color: '#0062ff',
                      mr: 2
                    }}>
                      <MenuBookOutlined fontSize="large" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1117' }}>
                      Resource Library
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#546e7a' }}>
                    Access and contribute to our growing collection of high-quality study materials, practice tests, and notes organized by subject.
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FeatureCard>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      background: 'rgba(0, 98, 255, 0.1)',
                      color: '#0062ff',
                      mr: 2
                    }}>
                      <EmojiEventsOutlined fontSize="large" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1117' }}>
                      Progress Tracking
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#546e7a' }}>
                    Monitor your academic progress, set goals, and celebrate achievements with our intuitive tracking system.
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
        
        {/* Testimonials */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: '#0d1117',
                mb: 1
              }}
            >
              Success Stories
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                color: '#546e7a',
                mb: 6,
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              See how Study Buddy has helped students transform their academic experience
            </Typography>
          </motion.div>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                >
                  <TestimonialCard>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#546e7a',
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.6
                      }}
                    >
                      "{testimonial.content}"
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0d1117' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0062ff' }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </TestimonialCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box 
            sx={{ 
              p: 6, 
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #0062ff 0%, #00c6ff 100%)',
              boxShadow: '0 15px 35px rgba(0, 98, 255, 0.2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.1,
                background: 'radial-gradient(circle at top right, #ffffff 0%, transparent 70%)',
              }}
            />
            
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: '#ffffff',
                position: 'relative',
                zIndex: 1
              }}
            >
              Ready to Transform Your Learning Experience?
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 4,
                maxWidth: '700px',
                mx: 'auto',
                position: 'relative',
                zIndex: 1
              }}
            >
              Join thousands of students who are already achieving their academic goals with Study Buddy
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                background: '#ffffff',
                color: '#0062ff',
                borderRadius: '30px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  background: '#f5f7ff',
                  boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
                },
                position: 'relative',
                zIndex: 1
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Home;
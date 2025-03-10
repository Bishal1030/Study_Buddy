import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../assets/Logo.png';
import ChatWindow from './ChatBot/ChatWindow'; // Corrected import path
import FloatingChatButton from './ChatBot/FloatingChatButton'; // Import FloatingChatButton


function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Add this state for calendar
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Add this handler
    const toggleCalendar = () => {
      setIsCalendarOpen(prev => !prev);
    };

  // State to manage the chat window visibility
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Function to toggle the chat window visibility
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  // Menu toggle logic for user profile
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                fontFamily: "'Dancing Script', cursive",
                fontSize: '2rem',
                letterSpacing: '1px',
                background: 'linear-gradient(45deg,rgb(255, 255, 255) 30%,rgb(243, 243, 243) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                padding: '0.2em 0',
                '& span': {
                  fontFamily: "'Dancing Script', cursive",
                  background: 'linear-gradient(45deg,rgb(255, 255, 255) 30%,rgb(255, 255, 255) 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                },
                filter: 'contrast(1.1)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              Study<span>Buddy</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {currentUser ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/dashboard"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                    textTransform: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'currentColor',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&::after': {
                        transform: 'scaleX(1)',
                        transformOrigin: 'left',
                      }
                    }
                  }}
                >
                  Find Buddies
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/resources"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.95rem',
                    fontWeight: location.pathname === "/resources" ? 600 : 400,
                    letterSpacing: '0.8px',
                    textTransform: 'none',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      '&::after': {
                        width: '100%',
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: location.pathname === "/resources" ? '100%' : '0%',
                      height: '2px',
                      backgroundColor: 'white',
                      transition: 'width 0.3s ease',
                    },
                  }}
                >
                  Resources
                </Button>

                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  {currentUser.photoURL ? (
                    <Avatar 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        }
                      }}
                    />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        }
                      }
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => {
                      handleClose();
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/signup"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* This toolbar acts as a spacer */}

      {/* Floating chat button */}
      <FloatingChatButton toggleChat={toggleChat} />

      {/* Chat window */}
      <ChatWindow isChatOpen={isChatOpen} toggleChat={toggleChat} />
    </>
  );
}

export default Navbar;
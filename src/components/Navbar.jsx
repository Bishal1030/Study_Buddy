import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../assets/Logo.png';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

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
    <AppBar position="static">
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
              fontWeight: 800,
              fontFamily: "'Nunito', sans-serif",
              fontSize: '1.8rem',
              letterSpacing: '0.5px',
              background: 'linear-gradient(45deg, #2196F3 30%, #00E676 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              padding: '0.2em 0',
              '& span': {
                color: '#90caf9',
                fontWeight: 900,
              },
              animation: 'glow 1.5s ease-in-out infinite alternate',
              '@keyframes glow': {
                from: {
                  textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #2196F3, 0 0 20px #2196F3'
                },
                to: {
                  textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #00E676, 0 0 40px #00E676'
                }
              }
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
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.5px',
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
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.5px',
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
                  sx={{
                    gap: 1,
                    '&:hover': {
                      '& .MuiSvgIcon-root': {
                        transform: 'scale(1.1)',
                      }
                    }
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    gap: 1,
                    '&:hover': {
                      '& .MuiSvgIcon-root': {
                        transform: 'scale(1.1)',
                      }
                    }
                  }}
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
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.5px',
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
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.5px',
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
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
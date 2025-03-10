import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Link, 
  Divider,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  KeyboardArrowUp
} from '@mui/icons-material';

const FooterLink = styled(Link)(({ theme }) => ({
  color: '#ffffff',
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  display: 'block',
  marginBottom: '8px',
  fontSize: '0.95rem',
  '&:hover': {
    color: '#89CFF0',
    textDecoration: 'none',
  }
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: '16px',
  color: 'rgb(250, 255, 216)',
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: '#ffffff',
  background: 'rgba(0, 98, 255, 0.1)',
  marginRight: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(0, 98, 255, 0.2)',
    transform: 'translateY(-3px)',
  }
}));

const Footer = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <Box 
      component="footer" 
      sx={{
        background: '#132f4c',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 98, 255, 0.1)',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(45deg,rgb(250, 255, 216) 30%, #00c6ff 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}>
                Study Buddy
              </Typography>
              <Typography variant="body2" sx={{ color: '#ffffff', mb: 2 }}>
                Connecting students for collaborative learning and academic success since 2023.
              </Typography>
              <Box sx={{ display: 'flex', mt: 2 }}>
                <SocialIconButton size="small" aria-label="facebook">
                  <Facebook fontSize="small" />
                </SocialIconButton>
                <SocialIconButton size="small" aria-label="twitter">
                  <Twitter fontSize="small" />
                </SocialIconButton>
                <SocialIconButton size="small" aria-label="instagram">
                  <Instagram fontSize="small" />
                </SocialIconButton>
                <SocialIconButton size="small" aria-label="linkedin">
                  <LinkedIn fontSize="small" />
                </SocialIconButton>
                <SocialIconButton size="small" aria-label="GitHub">
                  <GitHub fontSize="small" />
                </SocialIconButton>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <FooterHeading variant="subtitle1">
              Platform
            </FooterHeading>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/resources">Study Resources</FooterLink>
            <FooterLink href="#">Find Study BUddies</FooterLink>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <FooterHeading variant="subtitle1">
              Resources
            </FooterHeading>
            <FooterLink href="#">Study Tips</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Success Stories</FooterLink>
            <FooterLink href="#">FAQ</FooterLink>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <FooterHeading variant="subtitle1">
              Company
            </FooterHeading>
            <FooterLink href="#">About Us</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
            <FooterLink href="#">Universities</FooterLink>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(0, 98, 255, 0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Typography variant="body2" sx={{ color: '#546e7a', mb: isMobile ? 2 : 0 }}>
            © {new Date().getFullYear()} Study Buddy. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FooterLink href="#" sx={{ mx: 1 }}>Privacy Policy</FooterLink>
            <Box component="span" sx={{ color: '#546e7a' }}>•</Box>
            <FooterLink href="#" sx={{ mx: 1 }}>Terms of Service</FooterLink>
            <IconButton 
              onClick={scrollToTop} 
              size="small"
              sx={{ 
                ml: 2, 
                background: 'rgba(0, 98, 255, 0.1)',
                color: '#0062ff',
                '&:hover': {
                  background: 'rgba(0, 98, 255, 0.2)',
                }
              }}
              aria-label="scroll to top"
            >
              <KeyboardArrowUp fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
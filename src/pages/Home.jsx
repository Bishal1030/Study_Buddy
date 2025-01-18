import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ShareIcon from '@mui/icons-material/Share';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { cloudinaryConfig } from '../config/cloudinary';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Custom styled components
const WelcomeText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(45deg, #90caf9 30%, #81c784 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 20px rgba(144, 202, 249, 0.5)', // Adds a glow effect
}));

const SubText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Roboto', sans-serif",
  color: '#90caf9', // Lighter blue for better visibility
  marginBottom: theme.spacing(4),
}));

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const predefinedCategories = [
    'Computer Science',
    'Information Technology',
    'Science',
    'Mathematics',
    'Engineering',
    'Other'
  ];

  const handleFindBuddies = () => {
    navigate('/dashboard');
  };

  const handleShareResources = () => {
    navigate('/resources');
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !category || !title) return;

    try {
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('api_key', cloudinaryConfig.apiKey);

      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
        formData
      );

      if (!response.data.secure_url) {
        throw new Error('Failed to get upload URL');
      }

      // Add document to Firestore
      await addDoc(collection(db, 'resources'), {
        title,
        description,
        category: category === 'Other' ? customCategory : category,
        fileUrl: response.data.secure_url,
        fileName: file.name,
        fileType: file.type,
        publicId: response.data.public_id, // Store Cloudinary public ID
        uploadedBy: currentUser.uid,
        uploaderName: currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });

      setOpenUpload(false);
      setFile(null);
      setCategory('');
      setCustomCategory('');
      setTitle('');
      setDescription('');

      // Show success message
      alert('Resource uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Failed to upload resource. Please try again.');
    }
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
                      <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#90caf9' }}>
                        Find Buddies
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#e3f2fd' }}>
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
                      <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#90caf9' }}>
                        Share Resources
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#e3f2fd' }}>
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

      {/* Upload Dialog */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Share Resource
          <IconButton
            onClick={() => setOpenUpload(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <TextField
              select
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {predefinedCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            {category === 'Other' && (
              <TextField
                label="Custom Category"
                fullWidth
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4"
              />
            </Button>

            {file && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {file.name}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || !category || !title}
            >
              Share Resource
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Home; 
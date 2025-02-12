import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { cloudinaryConfig } from '../config/cloudinary';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Modal
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    expert: '',
    good: '',
    intermediate: '',
    beginner: '',
    interested: '',
    bio: '',
    photoURL: '',
    publicId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(prev => ({
            ...prev,
            ...docSnap.data()
          }));
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('api_key', cloudinaryConfig.apiKey);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Update profile state with new photo URL
      setProfile(prev => ({
        ...prev,
        photoURL: data.secure_url
      }));

      // Optionally update Firestore with the new photo URL
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { photoURL: data.secure_url });

      setSuccess(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), profile);
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile.photoURL}
              sx={{ 
                width: 100, 
                height: 100, 
                mr: 3,
                cursor: 'pointer'
              }}
              onClick={() => profile.photoURL && setPreviewOpen(true)}
            >
              {currentUser?.name?.[0] || 'U'}
            </Avatar>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <IconButton
              sx={{
                position: 'absolute',
                right: 20,
                bottom: 0,
                bgcolor: 'background.paper'
              }}
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : <PhotoCamera />}
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h4">{currentUser?.name}</Typography>
            <Typography color="textSecondary">{currentUser?.email}</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Bio"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={profile.bio || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
          />

          {['expert', 'good', 'intermediate', 'beginner', 'interested'].map((level) => (
            <TextField
              key={level}
              label={`${level.charAt(0).toUpperCase() + level.slice(1)} in`}
              fullWidth
              margin="normal"
              value={profile[level] || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, [level]: e.target.value }))}
              helperText="Separate multiple skills with commas"
            />
          ))}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#0284C7',
               mt: 3 }}
            disabled={loading}
          >
            Save Profile
          </Button>
        </Box>
      </Paper>

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          component="img"
          src={profile.photoURL}
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 1
          }}
          onClick={() => setPreviewOpen(false)}
        />
      </Modal>
    </Container>
  );
}

export default Profile;
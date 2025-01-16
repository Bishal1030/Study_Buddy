import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
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
} from '@mui/material';

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
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

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
          <Avatar
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {currentUser?.name?.[0] || 'U'}
          </Avatar>
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
            sx={{ mt: 3 }}
            disabled={loading}
          >
            Save Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile; 
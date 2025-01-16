import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography,
  Chip,
  Card,
  CardContent,
  TextField,
  Button
} from '@mui/material';

function Dashboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [aiQuery, setAiQuery] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid)
      );
    };
    fetchUsers();
  }, [currentUser]);

  const findMatches = (input) => {
    const keywords = input.toLowerCase().split(' ');
    return users.filter(user => 
      keywords.some(keyword => 
        Object.entries(user)
          .filter(([key]) => ['expert', 'good', 'intermediate', 'beginner', 'interested'].includes(key))
          .some(([_, value]) => value.toLowerCase().includes(keyword))
      )
    );
  };

  const handleAiSearch = (e) => {
    e.preventDefault();
    const foundMatches = findMatches(aiQuery);
    setMatches(foundMatches);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* User Badges */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Expertise
            </Typography>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(currentUser)
                .filter(([key]) => ['expert', 'good', 'intermediate', 'beginner', 'interested'].includes(key))
                .map(([key, value]) => (
                  <Chip 
                    key={key}
                    label={`${key}: ${value}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
            </div>
          </Paper>
        </Grid>

        {/* AI Chat */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Study Buddy Finder
            </Typography>
            <form onSubmit={handleAiSearch}>
              <TextField
                fullWidth
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="What kind of study buddy are you looking for?"
                margin="normal"
              />
              <Button 
                type="submit"
                variant="contained"
                fullWidth
              >
                Find Matches
              </Button>
            </form>
            {matches.map(user => (
              <Card key={user.id} sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography color="textSecondary">
                    Expert in: {user.expert}
                  </Typography>
                  <Button 
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* User List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Study Buddies
            </Typography>
            <Grid container spacing={2}>
              {users.map(user => (
                <Grid item xs={12} sm={6} key={user.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Expert in: {user.expert}
                      </Typography>
                      <Typography variant="body2">
                        Good in: {user.good}
                      </Typography>
                      <Button 
                        variant="contained"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 
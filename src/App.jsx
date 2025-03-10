import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Uploads from './pages/Uploads';
import Profile from './pages/Profile';
import { ThemeProvider, createTheme, Box, Typography } from '@mui/material';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#757ce8',
      main: '#3f50b5', // Lighter blue
    },
    secondary: {
      main: '#81c784', // Lighter green
    },
    background: {
      default: '#0a1929', // Dark blue-black
      paper: '#132f4c', // Darker blue
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          // background: 'linear-gradient(45deg, #0284C7 30%, #173a5e 90%)',
          background: '#0284C7', //nav
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #0284C7 30%, #0284C7 90%)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        bgcolor: '  ', 
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column' 
      }}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Navbar />
              <Box sx={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/resources" 
                    element={
                      <PrivateRoute>
                        <Resources />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/uploads"
                    element={
                      <PrivateRoute>
                        <Uploads />
                      </PrivateRoute>
                    }
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </Box>
              <Footer/>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;

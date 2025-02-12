import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";

const AnimatedCard = ({ children, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export default function Uploads() {
  const { currentUser } = useAuth();
  const [userUploads, setUserUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserUploads();
  }, [currentUser?.uid]);

  const fetchUserUploads = async () => {
    if (!currentUser) {
      console.log("No current user");
      return;
    }
    
    try {
      console.log("Fetching uploads for user:", currentUser.uid);
      const resourcesRef = collection(db, "resources");
      
      // Query for both new and old field names
      const [newFieldQuery, oldFieldQuery] = await Promise.all([
        getDocs(query(resourcesRef, where("uploaderId", "==", currentUser.uid))),
        getDocs(query(resourcesRef, where("uploadedBy", "==", currentUser.uid)))
      ]);
      
      console.log("Query results:", {
        newFieldSize: newFieldQuery.size,
        oldFieldSize: oldFieldQuery.size
      });
      
      // Combine results, removing duplicates
      const uploads = new Map();
      
      [...newFieldQuery.docs, ...oldFieldQuery.docs].forEach((doc) => {
        if (!uploads.has(doc.id)) {
          const data = doc.data();
          console.log("Document data:", data);
          uploads.set(doc.id, {
            id: doc.id,
            ...data
          });
        }
      });
      
      const finalUploads = Array.from(uploads.values());
      console.log("Final uploads array:", finalUploads);
      setUserUploads(finalUploads);
    } catch (error) {
      console.error("Error fetching user uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      await deleteDoc(doc(db, "resources", selectedCollection.id));
      setUserUploads(prev => prev.filter(upload => upload.id !== selectedCollection.id));
      setDeleteDialogOpen(false);
      setSelectedCollection(null);
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await Promise.all(
        userUploads.map(upload => deleteDoc(doc(db, "resources", upload.id)))
      );
      setUserUploads([]);
      setDeleteDialogOpen(false);
      setSelectedCollection(null);
    } catch (error) {
      console.error("Error deleting all uploads:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ 
        mb: { xs: 2, sm: 4 }, 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2
      }}>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            color: '#0284C7',
            fontSize: { xs: '1.4rem', sm: '1.7rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          My Uploads
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="contained"
            onClick={() => navigate('/resources', { state: { openUpload: true } })}
            startIcon={<CloudUploadIcon />}
            fullWidth={false}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              textTransform: 'none',
              backgroundColor: '#0284C7',
              '&:hover': {
                backgroundColor: '#0369a1',
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Upload Resources
          </Button>
          {userUploads.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setSelectedCollection({ id: "all" });
                setDeleteDialogOpen(true);
              }}
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Delete All
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : userUploads.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: "center", 
            py: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            padding: { xs: '16px', sm: '24px' },
            margin: { xs: '16px', sm: '24px' },
          }}
        >
          <InfoIcon 
            sx={{ 
              fontSize: { xs: '36px', sm: '48px' },
              color: '#0A4B7C',
              mb: 2 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: "'Montserrat', sans-serif",
              color: '#0A4B7C',
              fontWeight: 500,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            You haven't uploaded any resources yet
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: "'Montserrat', sans-serif",
              color: '#0A4B7C',
              mt: 1,
              opacity: 0.8,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            Start sharing by uploading your first resource
          </Typography>
        </Box>
      ) : (
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          {userUploads.map((upload, index) => (
            <AnimatedCard key={upload.id} index={index}>
              <Card sx={{ 
                p: { xs: 2, sm: 3 }, 
                position: "relative",
                display: "flex",
                flexDirection: "column",
                backgroundColor: '#0284C7',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369a1 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(2, 132, 199, 0.15)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(2, 132, 199, 0.25)',
                },
              }}>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: { xs: 4, sm: 8 },
                    right: { xs: 4, sm: 8 },
                    color: "rgba(255, 255, 255, 0.9)",
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  onClick={() => {
                    setSelectedCollection(upload);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>

                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      pr: { xs: 4, sm: 5 },
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {upload.title}
                  </Typography>
                  <Typography 
                    sx={{ 
                      mb: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      color: 'rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    {upload.description || "No description provided"}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 }
                }}>
                  <Chip
                    label={upload.category}
                    size="small"
                    sx={{ 
                      borderRadius: 1,
                      fontFamily: "'Montserrat', sans-serif",
                      width: { xs: '100%', sm: 'auto' },
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      }
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    {upload.files.length} Files
                  </Typography>
                </Box>
              </Card>
            </AnimatedCard>
          ))}
        </Stack>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCollection(null);
        }}
        PaperProps={{
          sx: { 
            width: { xs: '90%', sm: 'auto' },
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: "'Montserrat', sans-serif",
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          {selectedCollection?.id === "all"
            ? "Delete All Uploads"
            : "Delete Upload"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ 
            fontFamily: "'Montserrat', sans-serif",
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            {selectedCollection?.id === "all"
              ? "Are you sure you want to delete all your uploads? This action cannot be undone."
              : "Are you sure you want to delete this upload? This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedCollection(null);
            }}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (selectedCollection?.id === "all") {
                handleDeleteAll();
              } else {
                handleDeleteCollection();
              }
            }}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              textTransform: 'none',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

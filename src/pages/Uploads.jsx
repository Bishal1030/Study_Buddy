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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            color: '#fff'
          }}
        >
          My Uploads
        </Typography>
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
            }}
          >
            Delete All
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : userUploads.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            You haven't uploaded any resources yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {userUploads.map((upload, index) => (
            <AnimatedCard key={upload.id} index={index}>
              <Card sx={{ p: 3, position: "relative" }}>
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "error.main",
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
                    sx={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {upload.title}
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      fontFamily: "'Montserrat', sans-serif"
                    }}
                  >
                    {upload.description || "No description provided"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip
                    label={upload.category}
                    color="primary"
                    size="small"
                    sx={{ 
                      borderRadius: 1,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="primary.light"
                    sx={{ fontFamily: "'Montserrat', sans-serif" }}
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
      >
        <DialogTitle sx={{ fontFamily: "'Montserrat', sans-serif" }}>
          {selectedCollection?.id === "all"
            ? "Delete All Uploads"
            : "Delete Upload"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
            {selectedCollection?.id === "all"
              ? "Are you sure you want to delete all your uploads? This action cannot be undone."
              : "Are you sure you want to delete this upload? This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions>
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

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Stack,
  InputBase,
  Paper,
  InputAdornment,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchIcon from "@mui/icons-material/Search";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const CLOUDINARY_CLOUD_NAME = "dw1p4jkjb"; // Your actual cloud name
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Your actual upload preset

const categories = [
  "Computer Science",
  "Information Technology",
  "Science",
  "Mathematics",
  "Engineering",
  "Other",
];

const PDFViewer = ({ fileUrl }) => {
  const iframeRef = useRef(null);
  const interval = useRef();
  const [loaded, setLoaded] = useState(false);

  const pdfUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(
    fileUrl
  )}&chrome=false&embedded=true`;

  const clearCheckingInterval = useCallback(() => {
    clearInterval(interval.current);
  }, []);

  const onIframeLoaded = useCallback(() => {
    clearCheckingInterval();
    setLoaded(true);
  }, [clearCheckingInterval]);

  useEffect(() => {
    const delay = () =>
      setInterval(() => {
        try {
          // google docs page is blank (204), hence we need to reload the iframe
          if (iframeRef.current.contentWindow.document.body.innerHTML === "") {
            iframeRef.current.src = pdfUrl;
          }
        } catch (e) {
          // google docs page is being loaded, but will throw CORS error
          // it means that the page won't be blank and we can remove the checking interval
          onIframeLoaded();
        }
      }, 1000);

    if (iframeRef.current) {
      interval.current = delay();
    }

    return clearCheckingInterval;
  }, [pdfUrl, onIframeLoaded, clearCheckingInterval]);

  return (
    <Box sx={{ width: "100%", height: "70vh", position: "relative" }}>
      {!loaded && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading PDF...</Typography>
        </Box>
      )}
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="PDF Viewer"
        onLoad={onIframeLoaded}
      />
    </Box>
  );
};

const AnimatedCard = ({ children, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default function Resources() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "Computer Science",
    thumbnail: null,
    thumbnailPreview: null,
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (location.state?.openUpload) {
      setOpenUpload(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "resources"));
      console.log("Raw Firestore data:", querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const resourcesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Processing document:", doc.id, data);
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          uploaderId: data.uploaderId || data.uploadedBy, // Handle both old and new field names
          uploaderName: data.uploaderName,
          createdAt: data.createdAt?.toDate() || data.uploadDate?.toDate() || new Date(),
          thumbnailUrl: data.thumbnailUrl || null,
          files: Array.isArray(data.files) ? data.files : [],
        };
      });

      console.log("Fetched resources:", resourcesData);
      setResources(resourcesData);
    } catch (error) {
      console.error("Error fetching resources:", error);
      alert("Error loading resources");
    } finally {
      setIsLoading(false);
    }
  };

  const groupedResources = useMemo(() => {
    const grouped = resources.reduce((acc, resource) => {
      if (!acc[resource.title]) {
        acc[resource.title] = {
          ...resource,
          files: [],
        };
      }
      if (resource.files) {
        acc[resource.title].files.push(...resource.files);
      }
      if (resource.thumbnailUrl) {
        acc[resource.title].thumbnailUrl = resource.thumbnailUrl;
      }
      return acc;
    }, {});

    console.log("Grouped resources with thumbnails:", 
      Object.values(grouped).map(r => ({
        title: r.title,
        thumbnailUrl: r.thumbnailUrl
      }))
    );

    return grouped;
  }, [resources]);

  const filteredResources = Object.values(groupedResources).filter(collection => {
    const searchLower = searchQuery.toLowerCase();
    return (
      collection.title.toLowerCase().includes(searchLower) ||
      (collection.description && collection.description.toLowerCase().includes(searchLower)) ||
      collection.category.toLowerCase().includes(searchLower)
    );
  });

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollections((prev) => {
      const isSelected = prev.some((c) => c.title === collection.title);
      if (isSelected) {
        return prev.filter((c) => c.title !== collection.title);
      } else {
        return [...prev, collection];
      }
    });
  };

  const handleBulkDownload = async () => {
    if (selectedCollections.length === 0) return;

    try {
      setDownloading(true);
      const zip = new JSZip();

      for (const collection of selectedCollections) {
        const collectionFolder = zip.folder(collection.title);

        for (const file of collection.files) {
          const response = await fetch(file.fileUrl);
          const blob = await response.blob();
          collectionFolder.file(file.fileName, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "resources.zip");
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading files");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (collectionTitle) => {
    if (!currentUser) {
      alert("Please login to delete resources");
      return;
    }

    try {
      const resourcesToDelete = resources.filter(
        (r) => r.title === collectionTitle
      );

      const userOwnsResources = resourcesToDelete.some(
        (r) => r.uploaderId === currentUser.uid
      );
      if (!userOwnsResources) {
        alert("You can only delete your own resources!");
        return;
      }

      for (const resource of resourcesToDelete) {
        await deleteDoc(doc(db, "resources", resource.id));
      }

      setSelectedCollections((prev) =>
        prev.filter((c) => c.title !== collectionTitle)
      );

      await fetchResources();
      alert("Collection deleted successfully");
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection");
    }
  };

  const handleFileDownload = async (file, e) => {
    e.stopPropagation(); 
    try {
      const response = await fetch(file.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      window.open(file.fileUrl, "_blank");
    }
  };

  const handleThumbnailSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadForm((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");
      return data.secure_url;
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      throw error;
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!selectedFiles.length || !currentUser) {
      alert("Please select files and ensure you are logged in");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let thumbnailUrl = null;
      if (uploadForm.thumbnail) {
        try {
          const formData = new FormData();
          formData.append("file", uploadForm.thumbnail);
          formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

          console.log("Uploading thumbnail...");
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`Thumbnail upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          thumbnailUrl = data.secure_url;
          console.log("Thumbnail uploaded successfully:", thumbnailUrl);
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          alert("Failed to upload thumbnail, but continuing with file upload");
        }
      }

      const uploadedFiles = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.secure_url) {
          uploadedFiles.push({
            fileName: file.name,
            fileUrl: data.secure_url,
            fileType: file.type,
            size: file.size,
            public_id: data.public_id,
          });
        }

        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      // Create the resource data
      const resourceData = {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        uploaderId: currentUser.uid,
        uploaderName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        files: uploadedFiles,
        thumbnailUrl: thumbnailUrl || null
      };

      console.log("Creating new resource with data:", { ...resourceData, uid: currentUser.uid });

      // Add to Firestore
      const docRef = await addDoc(collection(db, "resources"), resourceData);
      console.log("Document written with ID:", docRef.id);

      setUploadForm({
        title: "",
        description: "",
        category: "Computer Science",
        thumbnail: null,
        thumbnailPreview: null,
      });
      setSelectedFiles([]);
      setOpenUpload(false);
      setUploadProgress(0);

      await fetchResources();
      alert("Files uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Error uploading files: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreview = (file, e) => {
    e.stopPropagation(); 
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const PreviewDialog = ({ open, onClose, file }) => {
    if (!file) return null;

    const isImage = /image\/(jpeg|jpg|png|gif|webp)/.test(file.fileType);
    const isPDF = file.fileType.includes("pdf");
    const isVideo = /video\/(mp4|webm|ogg)/.test(file.fileType);
    const isDoc =
      /(msword|document|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation)/.test(
        file.fileType
      );

    const handleDownload = async () => {
      try {
        if (isPDF || isDoc) {
          window.open(file.fileUrl, "_blank");
          return;
        }

        const link = document.createElement("a");
        link.href = file.fileUrl;
        link.download = file.fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download error:", error);
        window.open(file.fileUrl, "_blank");
      }
    };

    const handleListItemDownload = (downloadFile, e) => {
      e.stopPropagation();
      try {
        const isDocType =
          /(pdf|msword|document|vnd.openxmlformats|vnd.ms-)/.test(
            downloadFile.fileType
          );

        if (isDocType) {
          window.open(downloadFile.fileUrl, "_blank");
          return;
        }

        const link = document.createElement("a");
        link.href = downloadFile.fileUrl;
        link.download = downloadFile.fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download error:", error);
        window.open(downloadFile.fileUrl, "_blank");
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {file.fileName}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
              position: "relative",
            }}
          >
            {isImage && (
              <img
                src={file.fileUrl}
                alt={file.fileName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )}
            {(isPDF || isDoc) && (
              <>
                <PDFViewer fileUrl={file.fileUrl} />
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{ position: "absolute", bottom: 16, right: 16 }}
                >
                  Download Document
                </Button>
              </>
            )}
            {isVideo && (
              <video controls style={{ maxWidth: "100%", maxHeight: "70vh" }}>
                <source src={file.fileUrl} type={file.fileType} />
                Your browser does not support the video tag.
              </video>
            )}
            {!isImage && !isPDF && !isDoc && !isVideo && (
              <Box sx={{ textAlign: "center" }}>
                <ArticleIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography>
                  Preview not available for this file type.
                  <br />
                  <Button
                    onClick={handleDownload}
                    startIcon={<DownloadIcon />}
                    sx={{ mt: 2 }}
                  >
                    Download to view
                  </Button>
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const ExpandedViewDialog = ({ collection, open, onClose }) => {
    if (!collection) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "80vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5">{collection.title}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            {collection.thumbnailUrl && (
              <Box
                component="img"
                src={collection.thumbnailUrl}
                alt={collection.title}
                sx={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  borderRadius: 1,
                  mb: 2,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>{collection.description}</Typography>

            <Typography variant="h6" gutterBottom>Files</Typography>
            <List>
              {collection.files.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={(e) => handlePreview(file, e)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={(e) => handleFileDownload(file, e)}>
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    {getFileIcon(file.fileType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.fileName}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Category: {collection.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shared by: {collection.uploaderName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload Date: {collection.createdAt?.toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const handleDeleteCollection = async (collectionId, event) => {
    event.stopPropagation(); // Prevent card click event
    try {
      await deleteDoc(doc(db, "resources", collectionId));
      // Remove from local state
      setResources(prev => {
        return prev.filter(r => r.id !== collectionId);
      });
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const [downloading, setDownloading] = useState(false);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", pt: "64px" }}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {/* Your existing navbar content */}
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {searchOpen ? (
            <Paper
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <InputBase
                sx={{ 
                  ml: 1, 
                  flex: 1,
                  fontFamily: "'Montserrat', sans-serif",
                  '& .MuiInputBase-input': {
                    outline: 'none',
                  }
                }}
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Paper>
          ) : (
            <IconButton onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/uploads')}
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                textTransform: 'none',
              }}
            >
              My Uploads
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenUpload(true)}
              startIcon={<CloudUploadIcon />}
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                textTransform: 'none',
                backgroundColor: '#0284C7',
                '&:hover': {
                  backgroundColor: '#0369a1',
                },
              }}
            >
              Upload Resources
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredResources.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No resources found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredResources.map((collection, index) => (
              <AnimatedCard index={index} key={collection.title}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    backgroundColor: selectedCollections.some(
                      (c) => c.title === collection.title
                    )
                      ? "rgba(25, 118, 210, 0.08)"
                      : "rgba(255, 255, 255, 0.8)",
                    height: "180px",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                    position: "relative"
                  }}
                  onClick={() => setExpandedCollection(collection)}
                >
                  <Box
                    sx={{
                      width: '280px',
                      backgroundColor: 'primary.dark',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {collection.thumbnailUrl ? (
                      <>
                        <Box
                          component="img"
                          src={collection.thumbnailUrl}
                          alt={collection.title}
                          onError={(e) => {
                            console.error("Error loading thumbnail for:", collection.title);
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            const icon = document.createElement('div');
                            icon.innerHTML = '<svg style="font-size: 40px; color: white;" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>';
                            e.target.parentElement.appendChild(icon);
                          }}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.dark',
                        }}
                      >
                        <ArticleIcon sx={{ fontSize: 50, color: 'white' }} />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ 
                    p: 3, 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        >
                          {collection.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'primary.light',
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 500
                          }}
                        >
                          {collection.files.length} Files
                        </Typography>
                      </Box>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {collection.description || 'No description provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={collection.category}
                          color="primary"
                          size="small"
                          sx={{ 
                            borderRadius: 1,
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        />
                      </Stack>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        Shared by {collection.uploaderName}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </AnimatedCard>
            ))}
          </Stack>
        )}

        <ExpandedViewDialog
          collection={expandedCollection}
          open={Boolean(expandedCollection)}
          onClose={() => setExpandedCollection(null)}
        />

        <PreviewDialog
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }}
          file={previewFile}
        />

        <Dialog
          open={openUpload}
          onClose={() => !isUploading && setOpenUpload(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Share Resources</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Category"
                value={uploadForm.category}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                sx={{ mb: 2 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="thumbnail-upload"
                  type="file"
                  onChange={handleThumbnailSelect}
                />
                <label htmlFor="thumbnail-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    fullWidth
                  >
                    Upload Thumbnail
                  </Button>
                </label>
                {uploadForm.thumbnailPreview && (
                  <Box sx={{ mt: 1, position: "relative" }}>
                    <img
                      src={uploadForm.thumbnailPreview}
                      alt="Thumbnail preview"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(0,0,0,0.5)",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                      }}
                      onClick={() =>
                        setUploadForm((prev) => ({
                          ...prev,
                          thumbnail: null,
                          thumbnailPreview: null,
                        }))
                      }
                    >
                      <CloseIcon sx={{ color: "white" }} />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select Files
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files ({selectedFiles.length}):
                  </Typography>
                  {selectedFiles.length > 0 && (
                    <Button
                      size="small"
                      onClick={() => setSelectedFiles([])}
                      sx={{ mb: 1 }}
                    >
                      Clear Selection
                    </Button>
                  )}
                  <List dense>
                    {selectedFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() =>
                              setSelectedFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            <CloseIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                          sx={{
                            "& .MuiListItemText-primary": {
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {isUploading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Uploading... {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={
                  isUploading || !selectedFiles.length || !uploadForm.title
                }
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

const getFileIcon = (fileType) => {
  if (fileType.includes("pdf")) return <PictureAsPdfIcon />;
  if (fileType.includes("image")) return <ImageIcon />;
  if (fileType.includes("video")) return <VideoLibraryIcon />;
  return <ArticleIcon />;
};

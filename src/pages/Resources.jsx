import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Container, Typography, Box, Card, CardContent,
  Grid, Button, TextField, MenuItem, Dialog,
  DialogTitle, DialogContent, IconButton, Chip,
  List, ListItem, ListItemText, ListItemIcon, Checkbox,
  FormControlLabel, LinearProgress, CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const CLOUDINARY_CLOUD_NAME = 'dw1p4jkjb'; // Your actual cloud name
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Your actual upload preset

const categories = [
  'Computer Science',
  'Information Technology',
  'Science',
  'Mathematics',
  'Engineering',
  'Other'
];

const PDFViewer = ({ fileUrl }) => {
  const iframeRef = useRef(null);
  const interval = useRef();
  const [loaded, setLoaded] = useState(false);
  
  const pdfUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(fileUrl)}&chrome=false&embedded=true`;

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
    <Box sx={{ width: '100%', height: '70vh', position: 'relative' }}>
      {!loaded && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)'
        }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading PDF...</Typography>
        </Box>
      )}
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Viewer"
        onLoad={onIframeLoaded}
      />
    </Box>
  );
};

const AnimatedCard = ({ children, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

function Resources() {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Computer Science'
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Group resources by title to create collections
  const groupedResources = useMemo(() => {
    return resources.reduce((acc, resource) => {
      if (!acc[resource.title]) {
        acc[resource.title] = {
          title: resource.title,
          description: resource.description,
          category: resource.category,
          uploadDate: resource.uploadDate,
          uploaderName: resource.uploaderName,
          uploadedBy: resource.uploadedBy,
          files: []
        };
      }
      acc[resource.title].files.push(...resource.files);
      return acc;
    }, {});
  }, [resources]);

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollections(prev => {
      const isSelected = prev.some(c => c.title === collection.title);
      if (isSelected) {
        return prev.filter(c => c.title !== collection.title);
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

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'resources.zip');
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading files');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (collectionTitle) => {
    if (!currentUser) {
      alert('Please login to delete resources');
      return;
    }

    try {
      const resourcesToDelete = resources.filter(r => r.title === collectionTitle);
      
      // Check if user owns any of these resources
      const userOwnsResources = resourcesToDelete.some(r => r.uploadedBy === currentUser.uid);
      if (!userOwnsResources) {
        alert('You can only delete your own resources!');
        return;
      }

      for (const resource of resourcesToDelete) {
        await deleteDoc(doc(db, 'resources', resource.id));
      }
      
      // Remove deleted collection from selected collections
      setSelectedCollections(prev => prev.filter(c => c.title !== collectionTitle));
      
      await fetchResources();
      alert('Collection deleted successfully');
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFiles.length || !currentUser) {
      alert('Please select files and ensure you are logged in');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
          {
            method: 'POST',
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
            public_id: data.public_id
          });
        }

        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      await addDoc(collection(db, 'resources'), {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        uploadedBy: currentUser.uid,
        uploaderName: currentUser.displayName || 'Anonymous',
        uploadDate: serverTimestamp(),
        files: uploadedFiles
      });

      setUploadForm({
        title: '',
        description: '',
        category: 'Computer Science'
      });
      setSelectedFiles([]);
      setOpenUpload(false);
      setUploadProgress(0);
      
      await fetchResources();
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      alert(`Error uploading files: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const resourcesRef = collection(db, 'resources');
      const q = query(resourcesRef, orderBy('uploadDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate()
      }));
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      alert('Error loading resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Add missing downloading state
  const [downloading, setDownloading] = useState(false);

  const handlePreview = (file, e) => {
    e.stopPropagation(); // Prevent collection selection when clicking preview
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const PreviewDialog = ({ open, onClose, file }) => {
    if (!file) return null;

    // Enhanced file type checking
    const isImage = /image\/(jpeg|jpg|png|gif|webp)/.test(file.fileType);
    const isPDF = file.fileType.includes('pdf');
    const isVideo = /video\/(mp4|webm|ogg)/.test(file.fileType);
    const isDoc = /(msword|document|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation)/.test(file.fileType);

    const handleDownload = async () => {
      try {
        // For documents that need to be opened in their native apps
        if (isPDF || isDoc) {
          window.open(file.fileUrl, '_blank');
          return;
        }

        // For other files, direct download
        const link = document.createElement('a');
        link.href = file.fileUrl;
        link.download = file.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download error:', error);
        window.open(file.fileUrl, '_blank');
      }
    };

    // Update list item download handler with same logic
    const handleListItemDownload = (downloadFile, e) => {
      e.stopPropagation();
      try {
        const isDocType = /(pdf|msword|document|vnd.openxmlformats|vnd.ms-)/.test(downloadFile.fileType);
        
        if (isDocType) {
          window.open(downloadFile.fileUrl, '_blank');
          return;
        }

        const link = document.createElement('a');
        link.href = downloadFile.fileUrl;
        link.download = downloadFile.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download error:', error);
        window.open(downloadFile.fileUrl, '_blank');
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {file.fileName}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', position: 'relative' }}>
            {isImage && (
              <img 
                src={file.fileUrl} 
                alt={file.fileName}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            )}
            {(isPDF || isDoc) && (
              <>
                <PDFViewer fileUrl={file.fileUrl} />
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{ position: 'absolute', bottom: 16, right: 16 }}
                >
                  Download Document
                </Button>
              </>
            )}
            {isVideo && (
              <video
                controls
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              >
                <source src={file.fileUrl} type={file.fileType} />
                Your browser does not support the video tag.
              </video>
            )}
            {!isImage && !isPDF && !isDoc && !isVideo && (
              <Box sx={{ textAlign: 'center' }}>
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<CloudDownloadIcon />}
          onClick={handleBulkDownload}
          disabled={selectedCollections.length === 0 || downloading}
        >
          {downloading ? 'Downloading...' : `Download Selected (${selectedCollections.length})`}
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenUpload(true)}
        >
          Share Resources
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : resources.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No resources found. Be the first to share!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Object.values(groupedResources).map((collection, index) => (
            <Grid item xs={12} md={6} lg={4} key={collection.title}>
              <AnimatedCard index={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    backgroundColor: selectedCollections.some(c => c.title === collection.title)
                      ? 'rgba(25, 118, 210, 0.08)'
                      : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  onClick={() => handleCollectionSelect(collection)}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: 'text.primary',
                        }}
                      >
                        {collection.title}
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '48px',
                          opacity: 0.8,
                        }}
                      >
                        {collection.description}
                      </Typography>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                      >
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={collection.category} color="primary" size="small" />
                          <Chip 
                            label={`${collection.files.length} file${collection.files.length !== 1 ? 's' : ''}`}
                            size="small"
                          />
                        </Box>
                      </motion.div>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Shared by: {collection.uploaderName}
                        </Typography>
                        {collection.uploadedBy === currentUser?.uid && (
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(collection.title);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      <List dense sx={{ mt: 2 }}>
                        {collection.files.map((file, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Box sx={{ minWidth: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton
                                  edge="end"
                                  aria-label="preview"
                                  onClick={(e) => handlePreview(file, e)}
                                  size="small"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  aria-label="download"
                                  onClick={(e) => handleListItemDownload(file, e)}
                                  size="small"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Box>
                            }
                            sx={{
                              '& .MuiListItemText-primary': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                pr: 2
                              }
                            }}
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
                    </CardContent>
                  </motion.div>
                </Card>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      )}

      <PreviewDialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
        }}
        file={previewFile}
      />

      <Dialog open={openUpload} onClose={() => !isUploading && setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Share Resources
          {!isUploading && (
            <IconButton
              aria-label="close"
              onClick={() => setOpenUpload(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={uploadForm.category}
              onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
              sx={{ mb: 3 }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
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
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <CloseIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        sx={{
                          '& .MuiListItemText-primary': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
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
              disabled={isUploading || !selectedFiles.length || !uploadForm.title}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return <PictureAsPdfIcon />;
  if (fileType.includes('image')) return <ImageIcon />;
  if (fileType.includes('video')) return <VideoLibraryIcon />;
  return <ArticleIcon />;
};

export default Resources; 
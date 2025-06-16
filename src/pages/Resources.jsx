import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container, Typography, Box, Card, CardContent, Button, TextField,
  MenuItem, Dialog, DialogTitle, DialogContent, IconButton, Chip,
  List, ListItem, ListItemText, ListItemIcon, LinearProgress,
  CircularProgress, Stack, InputBase, Paper, InputAdornment
} from "@mui/material";
import {
  CloudUpload, Close, PictureAsPdf, Image as ImageIcon, Article,
  VideoLibrary, Delete, Download, Visibility, Search, Upload
} from "@mui/icons-material";
import { db } from "../config/firebase";
import {
  collection, addDoc, query, orderBy, getDocs, serverTimestamp,
  deleteDoc, doc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const CLOUDINARY_CLOUD_NAME = "dw1p4jkjb";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const categories = ["Computer Science", "Information Technology", "Science", "Mathematics", "Engineering", "Other"];

const PDFViewer = ({ fileUrl }) => {
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const pdfUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(fileUrl)}&chrome=false&embedded=true`;

  const onIframeLoaded = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    const checkIframe = setInterval(() => {
      try {
        if (iframeRef.current?.contentWindow.document.body.innerHTML === "") {
          iframeRef.current.src = pdfUrl;
        }
      } catch (e) {
        onIframeLoaded();
        clearInterval(checkIframe);
      }
    }, 1000);

    return () => clearInterval(checkIframe);
  }, [pdfUrl, onIframeLoaded]);

  return (
    <Box sx={{ width: "100%", height: "70vh", position: "relative" }}>
      {!loaded && (
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <CircularProgress sx={{ color: '#667eea' }} />
        </Box>
      )}
      <iframe ref={iframeRef} src={pdfUrl} width="100%" height="100%" style={{ border: "none" }} title="PDF Viewer" onLoad={onIframeLoaded} />
    </Box>
  );
};

const AnimatedCard = ({ children, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    title: "", description: "", category: "Computer Science",
    thumbnail: null, thumbnailPreview: null
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResources();
    if (location.state?.openUpload) {
      setOpenUpload(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "resources"));
      const resourcesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id, title: data.title, description: data.description,
          category: data.category, uploaderId: data.uploaderId || data.uploadedBy,
          uploaderName: data.uploaderName, createdAt: data.createdAt?.toDate() || new Date(),
          thumbnailUrl: data.thumbnailUrl || null, files: Array.isArray(data.files) ? data.files : []
        };
      });
      setResources(resourcesData);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedResources = useMemo(() => {
    const grouped = resources.reduce((acc, resource) => {
      if (!acc[resource.title]) {
        acc[resource.title] = { ...resource, files: [] };
      }
      if (resource.files) acc[resource.title].files.push(...resource.files);
      if (resource.thumbnailUrl) acc[resource.title].thumbnailUrl = resource.thumbnailUrl;
      return acc;
    }, {});
    return grouped;
  }, [resources]);

  const filteredResources = Object.values(groupedResources).filter(collection => {
    const searchLower = searchQuery.toLowerCase();
    return collection.title.toLowerCase().includes(searchLower) ||
           (collection.description && collection.description.toLowerCase().includes(searchLower)) ||
           collection.category.toLowerCase().includes(searchLower);
  });

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
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
      window.open(file.fileUrl, "_blank");
    }
  };

  const handleThumbnailSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadForm(prev => ({ ...prev, thumbnail: file, thumbnailPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length || !currentUser) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let thumbnailUrl = null;
      if (uploadForm.thumbnail) {
        const formData = new FormData();
        formData.append("file", uploadForm.thumbnail);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST", body: formData
        });
        if (response.ok) {
          const data = await response.json();
          thumbnailUrl = data.secure_url;
        }
      }

      const uploadedFiles = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: "POST", body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFiles.push({
            fileName: file.name, fileUrl: data.secure_url, fileType: file.type,
            size: file.size, public_id: data.public_id
          });
        }
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      await addDoc(collection(db, "resources"), {
        title: uploadForm.title, description: uploadForm.description, category: uploadForm.category,
        uploaderId: currentUser.uid, uploaderName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(), files: uploadedFiles, thumbnailUrl
      });

      setUploadForm({ title: "", description: "", category: "Computer Science", thumbnail: null, thumbnailPreview: null });
      setSelectedFiles([]);
      setOpenUpload(false);
      await fetchResources();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreview = (file, e) => {
    e.stopPropagation();
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return <PictureAsPdf sx={{ color: '#667eea' }} />;
    if (fileType.includes("image")) return <ImageIcon sx={{ color: '#667eea' }} />;
    if (fileType.includes("video")) return <VideoLibrary sx={{ color: '#667eea' }} />;
    return <Article sx={{ color: '#667eea' }} />;
  };

  const PreviewDialog = ({ open, onClose, file }) => {
    if (!file) return null;

    const isImage = /image\/(jpeg|jpg|png|gif|webp)/.test(file.fileType);
    const isPDF = file.fileType.includes("pdf");
    const isVideo = /video\/(mp4|webm|ogg)/.test(file.fileType);

    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          {file.fileName}
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            {isImage && <img src={file.fileUrl} alt={file.fileName} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />}
            {isPDF && <PDFViewer fileUrl={file.fileUrl} />}
            {isVideo && <video controls style={{ maxWidth: "100%", maxHeight: "70vh" }}><source src={file.fileUrl} type={file.fileType} /></video>}
            {!isImage && !isPDF && !isVideo && (
              <Box sx={{ textAlign: "center" }}>
                <Article sx={{ fontSize: 60, mb: 2, color: '#667eea' }} />
                <Typography>Preview not available</Typography>
                <Button onClick={() => window.open(file.fileUrl, "_blank")} startIcon={<Download />} sx={{ mt: 2 }}>
                  Download to view
                </Button>
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
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ color: 'white' }}>{collection.title}</Typography>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {collection.thumbnailUrl && (
            <Box component="img" src={collection.thumbnailUrl} alt={collection.title}
                 sx={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: 2, mb: 2 }}
                 onError={(e) => { e.target.style.display = "none"; }} />
          )}
          <Typography variant="body1" paragraph>{collection.description}</Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>Files</Typography>
          <List>
            {collection.files.map((file, index) => (
              <ListItem key={index} sx={{ borderRadius: 1, mb: 1, bgcolor: 'rgba(102, 126, 234, 0.05)' }}
                        secondaryAction={
                          <Box>
                            <IconButton onClick={(e) => handlePreview(file, e)} sx={{ color: '#667eea' }}>
                              <Visibility />
                            </IconButton>
                            <IconButton onClick={(e) => handleFileDownload(file, e)} sx={{ color: '#667eea' }}>
                              <Download />
                            </IconButton>
                          </Box>
                        }>
                <ListItemIcon>{getFileIcon(file.fileType)}</ListItemIcon>
                <ListItemText primary={file.fileName} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
            <Typography variant="body2" color="text.secondary">Category: {collection.category}</Typography>
            <Typography variant="body2" color="text.secondary">Shared by: {collection.uploaderName}</Typography>
            <Typography variant="body2" color="text.secondary">Date: {collection.createdAt?.toLocaleDateString()}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h3" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
            fontWeight: 700
          }}>
            Resources
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {searchOpen ? (
              <Paper sx={{ p: '8px 16px', display: 'flex', alignItems: 'center', width: 300, borderRadius: 3 }}>
                <InputBase placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                           endAdornment={<IconButton size="small" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}><Close /></IconButton>} />
              </Paper>
            ) : (
              <IconButton onClick={() => setSearchOpen(true)} sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <Search />
              </IconButton>
            )}
            
            <Button variant="outlined" onClick={() => navigate('/uploads')} sx={{ 
              borderColor: '#667eea', color: '#667eea', borderRadius: 3,
              '&:hover': { borderColor: '#764ba2', color: '#764ba2', transform: 'translateY(-2px)' }
            }}>
              My Uploads
            </Button>
            
            <Button variant="contained" onClick={() => setOpenUpload(true)} startIcon={<CloudUpload />} sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)' }
            }}>
              Upload
            </Button>
          </Box>
        </Box>

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress sx={{ color: '#667eea' }} size={60} />
          </Box>
        ) : filteredResources.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary">No resources found</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredResources.map((collection, index) => (
              <AnimatedCard index={index} key={collection.title}>
                <Card onClick={() => setExpandedCollection(collection)} sx={{
                  display: "flex", cursor: "pointer", borderRadius: 3, overflow: "hidden", background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: "160px",
                  transition: "all 0.3s ease",
                  '&:hover': { transform: "translateY(-4px)", boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                }}>
                  <Box sx={{ width: '200px', position: 'relative', overflow: 'hidden' }}>
                    {collection.thumbnailUrl ? (
                      <Box component="img" src={collection.thumbnailUrl} alt={collection.title}
                           sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                           onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Article sx={{ fontSize: 40, color: 'white' }} />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                          {collection.title}
                        </Typography>
                        <Chip label={`${collection.files.length} Files`} size="small" sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'
                        }} />
                      </Box>
                      <Typography color="text.secondary" sx={{
                        overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                      }}>
                        {collection.description || 'No description provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={collection.category} size="small" variant="outlined" sx={{
                        borderColor: '#fff', color: '#fff'
                      }} />
                      <Typography variant="body2" color="text.secondary">
                        by {collection.uploaderName}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </AnimatedCard>
            ))}
          </Stack>
        )}

        {/* Dialogs */}
        <ExpandedViewDialog collection={expandedCollection} open={Boolean(expandedCollection)} onClose={() => setExpandedCollection(null)} />
        <PreviewDialog open={previewOpen} onClose={() => { setPreviewOpen(false); setPreviewFile(null); }} file={previewFile} />

        {/* Upload Dialog */}
        <Dialog open={openUpload} onClose={() => !isUploading && setOpenUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            Upload Resources
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 1 }}>
              <TextField fullWidth label="Title" value={uploadForm.title} required sx={{ mb: 2 }}
                         onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))} />
              
              <TextField fullWidth label="Description" value={uploadForm.description} multiline rows={3} sx={{ mb: 2 }}
                         onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))} />
              
              <TextField select fullWidth label="Category" value={uploadForm.category} sx={{ mb: 2 }}
                         onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </TextField>

              <input accept="image/*" style={{ display: "none" }} id="thumbnail-upload" type="file" onChange={handleThumbnailSelect} />
              <label htmlFor="thumbnail-upload">
                <Button variant="outlined" component="span" startIcon={<ImageIcon />} fullWidth sx={{ mb: 2 }}>
                  Upload Thumbnail
                </Button>
              </label>
              
              {uploadForm.thumbnailPreview && (
                <Box sx={{ mb: 2, position: "relative" }}>
                  <img src={uploadForm.thumbnailPreview} alt="Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "8px" }} />
                  <IconButton sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.5)" }}
                              onClick={() => setUploadForm(prev => ({ ...prev, thumbnail: null, thumbnailPreview: null }))}>
                    <Close sx={{ color: "white" }} />
                  </IconButton>
                </Box>
              )}

              <input type="file" multiple onChange={handleFileSelect} style={{ display: "none" }} id="file-input" />
              <label htmlFor="file-input">
                <Button variant="outlined" component="span" startIcon={<Upload />} fullWidth sx={{ mb: 2 }}>
                  Select Files
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>Selected Files ({selectedFiles.length}):</Typography>
                  <List dense>
                    {selectedFiles.map((file, index) => (
                      <ListItem key={index} sx={{ bgcolor: 'rgba(102, 126, 234, 0.05)', mb: 1, borderRadius: 1 }}
                                secondaryAction={
                                  <IconButton size="small" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}>
                                    <Close />
                                  </IconButton>
                                }>
                        <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                        <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {isUploading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{
                    '& .MuiLinearProgress-bar': { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                  }} />
                  <Typography variant="caption" sx={{ mt: 1, color: '#667eea' }}>
                    Uploading... {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
              )}

              <Button type="submit" variant="contained" fullWidth disabled={isUploading || !selectedFiles.length || !uploadForm.title} sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
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
  VideoLibrary, Delete, Download, Visibility, Search, Upload, Add
} from "@mui/icons-material";
import { db } from "../config/firebase";
import {
  collection, addDoc, query, orderBy, getDocs, serverTimestamp,
  deleteDoc, doc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";


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
          <CircularProgress />
        </Box>
      )}
      <iframe ref={iframeRef} src={pdfUrl} width="100%" height="100%" style={{ border: "none" }} title="PDF Viewer" onLoad={onIframeLoaded} />
    </Box>
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
    if (fileType.includes("pdf")) return <PictureAsPdf />;
    if (fileType.includes("image")) return <ImageIcon />;
    if (fileType.includes("video")) return <VideoLibrary />;
    return <Article />;
  };

 const PreviewDialog = ({ open, onClose, file }) => {
  if (!file) return null;

  const isImage = /image\/(jpeg|jpg|png|gif|webp)/.test(file.fileType);
  const isPDF = file.fileType.includes("pdf");
  const isVideo = /video\/(mp4|webm|ogg)/.test(file.fileType);
  const isAudio = /audio\/(mp3|wav|ogg|aac)/.test(file.fileType);
  const isDocOffice = /\.(docx|pptx|xlsx|xls)$/i.test(file.fileName);

  const docViewerUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(file.fileUrl)}&embedded=true`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">{file.fileName}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          {isImage && (
            <img src={file.fileUrl} alt={file.fileName} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
          )}
          {isPDF && (
            <PDFViewer fileUrl={file.fileUrl} />
          )}
          {isVideo && (
            <video controls style={{ maxWidth: "100%", maxHeight: "70vh" }}>
              <source src={file.fileUrl} type={file.fileType} />
              Your browser does not support the video tag.
            </video>
          )}
          {isAudio && (
            <audio controls style={{ width: "100%" }}>
              <source src={file.fileUrl} type={file.fileType} />
              Your browser does not support the audio element.
            </audio>
          )}
          {isDocOffice && (
            <iframe
              src={docViewerUrl}
              width="100%"
              height="600px"
              title="Office File Preview"
              style={{ border: "none" }}
            />
          )}
          {!isImage && !isPDF && !isVideo && !isAudio && !isDocOffice && (
            <Box sx={{ textAlign: "center", p: 4 }}>
              <Article sx={{ fontSize: 60, mb: 2, color: '#666' }} />
              <Typography color="text.secondary" sx={{ mb: 2 }}>Preview not available</Typography>
              <Button 
                onClick={() => window.open(file.fileUrl, "_blank")} 
                startIcon={<Download />} 
                variant="contained"
                sx={{ background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)' }}
              >
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
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5">{collection.title}</Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {collection.thumbnailUrl && (
            <Box 
              component="img" 
              src={collection.thumbnailUrl} 
              alt={collection.title}
              sx={{ 
                width: "100%", 
                maxHeight: "200px", 
                objectFit: "cover", 
                borderRadius: 2, 
                mb: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
              onError={(e) => { e.target.style.display = "none"; }} 
            />
          )}
          
          <Typography variant="body1" paragraph sx={{ color: '#fff', lineHeight: 1.6 }}>
            {collection.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
            Files ({collection.files.length})
          </Typography>
          
          <Box sx={{ bgcolor: '#f8f9ff', borderRadius: 2, p: 2 }}>
            {collection.files.map((file, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: index < collection.files.length - 1 ? 1 : 0,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                }}
              >
                <Box sx={{ mr: 2, color: '#000' }}>
                  {getFileIcon(file.fileType)}
                </Box>
                <Box sx={{ flex: 1, color: '#000'  }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{file.fileName}</Typography>
                  <Typography variant="caption" color="#000">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={(e) => handlePreview(file, e)} size="small" sx={{ mr: 1, color: '#000'}}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={(e) => handleFileDownload(file, e)} size="small" sx={{ color: '#000'}}>
                    <Download />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#f8f9ff', border: '1px solid #e0f0ff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Chip 
                label={collection.category} 
                size="small" 
                sx={{ 
                  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                  color: 'white',
                  fontWeight: 500
                }} 
              />
              <Typography variant="body2" color="green" sx={{ fontWeight: 600 }}>
                {collection.createdAt?.toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="#3b3b3b" sx={{ fontWeight: 500 }}>
              Shared by {collection.uploaderName}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: '#fafbff' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                backgroundClip: 'text', 
                WebkitBackgroundClip: 'text', 
                color: 'transparent',
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Resources
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/uploads')}
                sx={{ 
                  borderColor: '#0062ff', 
                  color: '#0062ff', 
                  borderRadius: 2,
                  px: 3,
                  '&:hover': { 
                    borderColor: '#00c6ff', 
                    color: '#00c6ff',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                My Uploads
              </Button>
              
              <Button 
                variant="contained" 
                onClick={() => setOpenUpload(true)} 
                startIcon={<Add />}
                sx={{
                  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)', 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 15px rgba(0, 98, 255, 0.3)',
                  '&:hover': { 
                    transform: 'translateY(-1px)', 
                    boxShadow: '0 6px 20px rgba(0, 98, 255, 0.4)' 
                  }
                }}
              >
                Upload
              </Button>
            </Box>
          </Box>

          {/* Search */}
          <Paper 
            sx={{ 
              background: '#f0f8ff',
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              maxWidth: 600,
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solidrgb(241, 245, 248)'
            }}
          >
            <Search sx={{ color: '#0062ff', mr: 2 }} />
            <InputBase 
              placeholder="Search resources by title, description, or category..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, color: '#1a1a1a' }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery("")}>
                <Close />
              </IconButton>
            )}
          </Paper>
        </Box>

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} sx={{ color: '#0062ff' }} />
          </Box>
        ) : filteredResources.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Article sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
              No resources found
            </Typography>
            <Typography color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to upload a resource!'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 3 }}>
            {filteredResources.map((collection, index) => (
              <Card 
                key={collection.id || index}
                onClick={() => setExpandedCollection(collection)} 
                sx={{
                  display: "flex", 
                  cursor: "pointer", 
                  borderRadius: 3, 
                  overflow: "hidden",
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  height: "180px",
                  border: '1px solid #f0f0f0',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  '&:hover': { 
                    transform: "translateY(-4px)", 
                    boxShadow: '0 12px 40px rgba(0,98,255,0.15)',
                    borderColor: '#0062ff'
                  }
                }}
              >
                {/* Thumbnail */}
                <Box sx={{ width: '240px', position: 'relative', overflow: 'hidden' }}>
                  {collection.thumbnailUrl ? (
                    <Box 
                      component="img" 
                      src={collection.thumbnailUrl} 
                      alt={collection.title}
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                  ) : (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)'
                    }}>
                      <Article sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                  )}
                  
                  {/* File count badge */}
                  <Chip 
                    label={`${collection.files.length} files`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      color: '#0062ff',
                      top: 12,
                      right: 12,
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Content */}
                <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#ededed',
                        mb: 1,
                        lineHeight: 1.3
                      }}
                    >
                      {collection.title}
                    </Typography>
                    <Typography 
                      color="text.secondary" 
                      sx={{
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        display: "-webkit-box",
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.5,
                        fontSize: '0.95rem'
                      }}
                    >
                      {collection.description || 'No description provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip 
                      label={collection.category} 
                      size="small" 
                      sx={{

                        border: '1.5px solid #fff',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.8rem'
                      }}
                    />
                    <Typography variant="body2" color="#ededed" sx={{ fontSize: '0.85rem' }}>
                      by {collection.uploaderName}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Dialogs */}
        <ExpandedViewDialog 
          collection={expandedCollection} 
          open={Boolean(expandedCollection)} 
          onClose={() => setExpandedCollection(null)} 
        />
        <PreviewDialog 
          open={previewOpen} 
          onClose={() => { setPreviewOpen(false); setPreviewFile(null); }} 
          file={previewFile} 
        />

        {/* Upload Dialog */}
        <Dialog 
          open={openUpload} 
          onClose={() => !isUploading && setOpenUpload(false)} 
          maxWidth="sm" 
          fullWidth
          sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Upload Resources</Typography>
            <IconButton onClick={() => !isUploading && setOpenUpload(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 1 }}>
              <TextField 
                fullWidth 
                label="Title" 
                value={uploadForm.title} 
                required 
                sx={{ mb: 3 }}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))} 
              />
              
              <TextField 
                fullWidth 
                label="Description" 
                value={uploadForm.description} 
                multiline 
                rows={3} 
                sx={{ mb: 3 }}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))} 
              />
              
              <TextField 
                select 
                fullWidth 
                label="Category" 
                value={uploadForm.category} 
                sx={{ mb: 3 }}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </TextField>

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
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  Upload Thumbnail
                </Button>
              </label>
              
              {uploadForm.thumbnailPreview && (
                <Box sx={{ mb: 2, position: "relative" }}>
                  <img 
                    src={uploadForm.thumbnailPreview} 
                    alt="Preview" 
                    style={{ 
                      width: "100%", 
                      maxHeight: "150px", 
                      objectFit: "contain", 
                      borderRadius: "8px" 
                    }} 
                  />
                  <IconButton 
                    sx={{ 
                      position: "absolute", 
                      top: 8, 
                      right: 8, 
                      bgcolor: "rgba(0,0,0,0.7)",
                      '&:hover': { bgcolor: "rgba(0,0,0,0.8)" }
                    }}
                    onClick={() => setUploadForm(prev => ({ ...prev, thumbnail: null, thumbnailPreview: null }))}
                  >
                    <Close sx={{ color: "white" }} />
                  </IconButton>
                </Box>
              )}

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
                  startIcon={<Upload />} 
                  fullWidth 
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  Select Files
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Selected Files ({selectedFiles.length}):
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f8f9ff', borderRadius: 2, p: 1 }}>
                    {selectedFiles.map((file, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          mb: 1,
                          bgcolor: 'white',
                          borderRadius: 1,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Box sx={{ mr: 2 }}>{getFileIcon(file.type)}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Close />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {isUploading && (
                <Box sx={{ mb: 3 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0f0ff',
                      '& .MuiLinearProgress-bar': { 
                        background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                        borderRadius: 4
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ mt: 1, color: '#0062ff', textAlign: 'center' }}>
                    Uploading... {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
              )}

              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={isUploading || !selectedFiles.length || !uploadForm.title} 
                sx={{
                  background: 'linear-gradient(45deg, #0062ff 20%, #00c6ff 90%)',
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(0, 98, 255, 0.3)',
                  '&:hover': { 
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(0, 98, 255, 0.4)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
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
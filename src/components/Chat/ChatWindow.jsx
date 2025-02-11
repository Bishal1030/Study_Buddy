import React, { useState, useEffect, useRef } from "react"
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Modal,
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import DeleteIcon from "@mui/icons-material/Delete"
import { useAuth } from "../../contexts/AuthContext"
import { db } from "../../config/firebase"
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore"

function ChatWindow({ recipientId, recipientName }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [profileDetails, setProfileDetails] = useState(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const { currentUser } = useAuth()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }

  useEffect(() => {
    if (!currentUser?.uid || !recipientId) {
      setLoading(false)
      return
    }

    const chatId = [currentUser.uid, recipientId].sort().join("-")
    let unsubscribe = null

    const setupChat = async () => {
      try {
        // Create chat document if it doesn't exist
        const chatDocRef = doc(db, "chats", chatId)
        const chatDoc = await getDoc(chatDocRef)

        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            users: [currentUser.uid, recipientId],
            createdAt: serverTimestamp(),
          })
        }

        // Listen to messages
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"))

        unsubscribe = onSnapshot(q, (snapshot) => {
          const messageData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setMessages(messageData)
          setLoading(false)
        })
      } catch (error) {
        console.error("Error setting up chat:", error)
        setError("Failed to setup chat")
        setLoading(false)
      }
    }

    setupChat()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser?.uid, recipientId])

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom()
    }
  }, [loading, messages])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || !currentUser?.uid || !recipientId) return

    const chatId = [currentUser.uid, recipientId].sort().join("-")

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "User",
        timestamp: serverTimestamp(),
      })

      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
    }
  }

  const handleDeleteChat = async () => {
    if (!currentUser?.uid || !recipientId) return

    const chatId = [currentUser.uid, recipientId].sort().join("-")
    setLoading(true)
    setDeleteDialogOpen(false)

    try {
      const messagesRef = collection(db, "chats", chatId, "messages")
      const snapshot = await getDocs(messagesRef)

      const batch = writeBatch(db)
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()

      setMessages([])
    } catch (error) {
      console.error("Error deleting messages:", error)
      setError("Failed to delete messages")
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileDetails = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        // Convert comma-separated strings to arrays
        ;["expert", "good", "intermediate", "beginner", "interested"].forEach((level) => {
          if (userData[level]) {
            userData[`${level}Skills`] = userData[level]
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          }
        })
        setProfileDetails(userData)
      }
    } catch (error) {
      console.error("Error fetching profile details:", error)
    }
  }

  const handleProfileClick = () => {
    fetchProfileDetails(recipientId)
    setProfileDialogOpen(true)
  }

  const handleImageClick = () => {
    setImagePreviewOpen(true)
  }

  const formatMessageDate = (date) => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === now.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#0a1929", color: "#90caf9" }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={3}
      sx={{
        height: "500px",
        display: "flex",
        flexDirection: "column",
        p: 2,
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
          }}
          onClick={handleProfileClick}
        >
          <Avatar
            sx={{
              bgcolor: "#1976d2",
              color: "#ffffff",
              width: 40,
              height: 40,
            }}
          >
            {recipientName[0]}
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              color: "#000000",
              fontWeight: 500,
            }}
          >
            {recipientName}
          </Typography>
        </Box>
        <IconButton onClick={() => setDeleteDialogOpen(true)} sx={{ color: "#757575" }}>
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
          position: "relative",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(0, 0, 0, 0.3)",
            },
          },
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress sx={{ color: "#1976d2" }} />
          </Box>
        )}

        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.senderId === currentUser?.uid ? "flex-end" : "flex-start",
              gap: 0.5,
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
                maxWidth: "85%",
              }}
            >
              {msg.senderId !== currentUser?.uid && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "#90caf9",
                    color: "#0a1929",
                    fontSize: "0.875rem",
                  }}
                >
                  {msg.senderName?.[0]}
                </Avatar>
              )}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: msg.senderId === currentUser?.uid ? "#1976d2" : "#f5f5f5",
                  color: msg.senderId === currentUser?.uid ? "#ffffff" : "#000000",
                  borderRadius: msg.senderId === currentUser?.uid ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </Box>

            <Typography
              variant="caption"
              sx={{
                px: 2,
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "0.75rem",
              }}
            >
              {msg.timestamp && formatMessageDate(msg.timestamp.toDate())}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f5f5f5",
              borderRadius: "20px",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.23)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.87)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
            },
            "& .MuiInputBase-input": {
              color: "rgba(0, 0, 0, 0.87)",
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!message.trim()}
          sx={{
            minWidth: "50px",
            height: "40px",
            borderRadius: "20px",
            backgroundColor: "#1976d2",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          <SendIcon />
        </Button>
      </Box>

      {/* Delete Chat Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            color: "inherit",
            border: "1px solid rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <DialogTitle>Delete Chat History</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all messages in this chat? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: "#90caf9",
              "&:hover": {
                backgroundColor: "rgba(144, 202, 249, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteChat}
            sx={{
              color: "#ff4444",
              "&:hover": {
                backgroundColor: "rgba(255, 68, 68, 0.1)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Profile Details</DialogTitle>
        <DialogContent>
          {profileDetails ? (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
                <Avatar
                  src={profileDetails.photoURL}
                  sx={{
                    width: 150,
                    height: 150,
                    cursor: "pointer",
                  }}
                  onClick={handleImageClick}
                />
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {profileDetails.displayName}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Email: {profileDetails.email}
                  </Typography>
                  {profileDetails.department && (
                    <Typography variant="body1" gutterBottom>
                      Department: {profileDetails.department}
                    </Typography>
                  )}
                  {profileDetails.semester && (
                    <Typography variant="body1" gutterBottom>
                      Semester: {profileDetails.semester}
                    </Typography>
                  )}
                </Box>
              </Box>

              {profileDetails.bio && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Bio
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {profileDetails.bio}
                  </Typography>
                </Box>
              )}

              {["expert", "good", "intermediate", "beginner", "interested"].map(
                (level) =>
                  profileDetails[`${level}Skills`]?.length > 0 && (
                    <Box sx={{ mb: 3 }} key={level}>
                      <Typography variant="h6" gutterBottom sx={{ textTransform: "capitalize" }}>
                        {level === "interested" ? "Interested In" : `${level} Skills`}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {profileDetails[`${level}Skills`].map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            sx={{
                              bgcolor:
                                level === "expert"
                                  ? "#4caf50"
                                  : level === "good"
                                    ? "#2196f3"
                                    : level === "intermediate"
                                      ? "#ff9800"
                                      : level === "beginner"
                                        ? "#f44336"
                                        : "#9c27b0",
                              color: "white",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ),
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Modal */}
      <Modal
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={profileDetails?.photoURL}
          sx={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
          }}
          onClick={() => setImagePreviewOpen(false)}
        />
      </Modal>
    </Paper>
  )
}

export default ChatWindow


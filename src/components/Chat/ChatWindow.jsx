import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

function ChatWindow({ recipientId, recipientName }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser?.uid || !recipientId) return;

    const setupChat = async () => {
      try {
        const chatId = [currentUser.uid, recipientId].sort().join('-');
        const chatDocRef = doc(db, 'chats', chatId);

        // Create or update chat document
        const chatDoc = await getDoc(chatDocRef);
        if (!chatDoc.exists()) {
          console.log('Creating new chat document');
          await setDoc(chatDocRef, {
            users: [currentUser.uid, recipientId],
            createdAt: serverTimestamp(),
            lastMessage: null
          });
        }

        // Listen to messages
        console.log('Setting up message listener for chat:', chatId);
        const q = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('Received message update:', snapshot.docs.length, 'messages');
          const messageData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messageData);
          setLoading(false);
          scrollToBottom();
        }, (error) => {
          console.error("Error in chat listener:", error);
          setError("Failed to load messages");
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up chat:", error);
        setError("Failed to setup chat");
        setLoading(false);
      }
    };

    const unsubscribe = setupChat();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser?.uid, recipientId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const chatId = [currentUser.uid, recipientId].sort().join('-');
      
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: message,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        timestamp: serverTimestamp(),
      });

      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '500px', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar>{recipientName[0]}</Avatar>
        {recipientName}
      </Typography>

      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2
      }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
              gap: 0.5,
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
            }}>
              {msg.senderId !== currentUser.uid && (
                <Avatar sx={{ width: 24, height: 24 }}>
                  {msg.senderName?.[0]}
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: msg.senderId === currentUser.uid ? 'primary.main' : 'grey.100',
                  color: msg.senderId === currentUser.uid ? 'white' : 'text.primary',
                  borderRadius: msg.senderId === currentUser.uid 
                    ? '20px 20px 4px 20px'
                    : '20px 20px 20px 4px',
                }}
              >
                <Typography variant="body1">
                  {msg.text}
                </Typography>
              </Paper>
            </Box>
            
            <Typography 
              variant="caption" 
              sx={{ 
                px: 2,
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              {msg.timestamp?.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSend} 
        sx={{ 
          display: 'flex', 
          gap: 1,
          mt: 'auto',
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          endIcon={<SendIcon />}
          sx={{ 
            borderRadius: '20px',
            px: 3
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatWindow; 
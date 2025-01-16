import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';

const SOCKET_SERVER = 'http://localhost:3001'; // Update with your server URL

function ChatWindow({ recipientId, recipientName }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { currentUser } = useAuth();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(SOCKET_SERVER);

    // Join private chat room
    const roomId = [currentUser.uid, recipientId].sort().join('-');
    socketRef.current.emit('join-room', roomId);

    // Listen for messages
    socketRef.current.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser.uid, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      senderId: currentUser.uid,
      senderName: currentUser.name,
      recipientId,
      content: message,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('send-message', newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <Paper sx={{ height: '500px', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chat with {recipientName}
      </Typography>

      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                maxWidth: '70%',
              }}
            >
              {msg.senderId !== currentUser.uid && (
                <Avatar sx={{ mr: 1 }}>{msg.senderName[0]}</Avatar>
              )}
              <Box>
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: msg.senderId === currentUser.uid ? 'primary.main' : 'grey.200',
                    color: msg.senderId === currentUser.uid ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                </Paper>
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit" variant="contained" endIcon={<SendIcon />}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatWindow; 
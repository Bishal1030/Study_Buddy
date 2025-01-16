const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite app URL
    methods: ["GET", "POST"]
  }
});

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-connected', (userId) => {
    activeUsers.set(socket.id, userId);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', (message) => {
    const roomId = [message.senderId, message.recipientId].sort().join('-');
    socket.to(roomId).emit('receive-message', message);
    console.log(`Message sent in room ${roomId}:`, message);
  });

  socket.on('disconnect', () => {
    const userId = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    console.log(`User ${userId} disconnected`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
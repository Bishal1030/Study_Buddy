import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });  // Explicitly point to the .env file in the parent directory

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, 
}
))

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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
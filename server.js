import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import tourRoutes from './routes/tourRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { registerSeatSocket } from './sockets/seatSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Attach io instance to express app
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'GhurBei (ঘুরবেসবাই)',
    timestamp: new Date().toISOString(),
  });
});

// Register real-time seat lock socket events
registerSeatSocket(io);

// Start Database in background & Server immediately
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 GhurBei MERN Server running on port ${PORT}`);
  console.log(`⚡ Real-time Socket.io active`);
  console.log(`🔒 Race Condition Protected Seat Locking initialized`);
  connectDB();
});

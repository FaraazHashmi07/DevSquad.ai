// backend/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const apiRoutes = require('./routes/api');

// Import services
const socketService = require('./services/socketService');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Socket.IO service
socketService.init(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Ensure data directory exists
fs.ensureDirSync(path.join(__dirname, 'data/projects'));

// Routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});

module.exports = server;
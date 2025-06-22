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
const { getApiStatus, testApiConnectivity } = require('./services/openaiService');

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

// API Status endpoint
app.get('/api/health', (req, res) => {
  const apiStatus = getApiStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apis: apiStatus
  });
});

// API connectivity test endpoint
app.get('/api/test-apis', async (req, res) => {
  try {
    const testResults = await testApiConnectivity();
    res.json({
      status: testResults.overall ? 'success' : 'partial',
      results: testResults
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with API validation
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`\n🚀 DevSquad.ai Server Started`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  // Validate API configuration on startup
  const apiStatus = getApiStatus();
  console.log('\n🔍 API Configuration Status:');

  if (apiStatus.gemma.initialized && apiStatus.mistral.initialized) {
    console.log('✅ All API clients ready for agent operations');

    // Optional: Test connectivity (uncomment for production)
    // try {
    //   console.log('🧪 Testing API connectivity...');
    //   const testResults = await testApiConnectivity();
    //   if (testResults.overall) {
    //     console.log('✅ API connectivity test passed');
    //   } else {
    //     console.log('⚠️  Some API connectivity issues detected');
    //   }
    // } catch (error) {
    //   console.log('⚠️  API connectivity test failed:', error.message);
    // }
  } else {
    console.log('⚠️  Some API clients not properly configured');
    console.log('   Agents may not function correctly until API keys are set');
  }

  console.log('\n📚 Documentation:');
  console.log('   Setup Guide: README.md');
  console.log('   Deployment: DEPLOYMENT.md');
  console.log('   API Status: http://localhost:' + PORT + '/api/health');
  console.log('   API Test: http://localhost:' + PORT + '/api/test-apis\n');
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
// backend/services/socketService.js
let io;

/**
 * Initialize Socket.IO server
 * @param {Object} socketIo - Socket.IO server instance
 */
exports.init = (socketIo) => {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on('joinProject', (projectId) => {
      if (typeof projectId !== 'string' || !projectId) {
        console.error('Invalid projectId:', projectId);
        return;
      }
      
      console.log(`Socket ${socket.id} joined project: ${projectId}`);
      socket.join(projectId);
      
      // Send acknowledgement
      socket.emit('joinedProject', { projectId });
    });
    
    socket.on('leaveProject', (projectId) => {
      if (typeof projectId !== 'string' || !projectId) {
        console.error('Invalid projectId:', projectId);
        return;
      }
      
      console.log(`Socket ${socket.id} left project: ${projectId}`);
      socket.leave(projectId);
    });
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
    
    // Handle user editing a file
    socket.on('fileEdit', ({ projectId, path, user, cursor }) => {
      if (!projectId || !path) return;
      
      // Broadcast to other clients that a user is editing a file
      socket.to(projectId).emit('userEditing', {
        projectId,
        path,
        user,
        cursor
      });
    });
  });
};

/**
 * Emit an event to all clients
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitToAll = (event, data) => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return;
  }
  
  io.emit(event, data);
};

/**
 * Emit an event to clients in a specific project
 * @param {string} projectId - Project unique identifier
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitToProject = (projectId, event, data) => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return;
  }
  
  if (!projectId) {
    console.error('Invalid projectId:', projectId);
    return;
  }
  
  io.to(projectId).emit(event, data);
};

/**
 * Get the Socket.IO server instance
 * @returns {Object} - Socket.IO server instance
 */
exports.getIo = () => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return null;
  }
  
  return io;
};
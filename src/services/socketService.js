import socketIOClient from 'socket.io-client';

// Socket service for managing WebSocket connections
import { SOCKET_URL } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.connected = false;
  }
  
  /**
   * Connect to the Socket.IO server
   * @returns {Object} - Socket instance
   */
  connect() {
    if (this.socket) {
      return this.socket;
    }
    
    this.socket = socketIOClient(SOCKET_URL);
    
    // Set up basic event handlers
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.connected = true;
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.connected = false;
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
    
    return this.socket;
  }
  
  /**
   * Disconnect from the Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners = {};
    }
  }
  
  /**
   * Join a project room
   * @param {string} projectId - Project ID to join
   */
  joinProject(projectId) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.emit('joinProject', projectId);
  }
  
  /**
   * Leave a project room
   * @param {string} projectId - Project ID to leave
   */
  leaveProject(projectId) {
    if (this.socket) {
      this.socket.emit('leaveProject', projectId);
    }
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {function} callback - Event callback
   */
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.on(event, callback);
    
    // Store listener for later cleanup
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {function} callback - Event callback to remove (optional)
   */
  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      // Remove specific callback
      this.socket.off(event, callback);
      
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    } else {
      // Remove all callbacks for this event
      this.socket.off(event);
      delete this.listeners[event];
    }
  }
  
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.emit(event, data);
  }
  
  /**
   * Notify that a file is being edited
   * @param {string} projectId - Project ID
   * @param {string} filePath - File path
   * @param {Object} cursor - Cursor position
   */
  notifyFileEdit(projectId, filePath, cursor = {}) {
    this.emit('fileEdit', {
      projectId,
      path: filePath,
      user: 'User',
      cursor
    });
  }
}

// Export singleton instance
export default new SocketService();
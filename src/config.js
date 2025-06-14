// src/config.js

/**
 * Configuration with environment variables for Vite
 * 
 * Vite uses import.meta.env instead of process.env
 * This file centralizes all environment variable access
 */

// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Socket URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Environment
export const NODE_ENV = import.meta.env.MODE || 'development';

// App version
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Other configs
export const DEFAULT_CONFIGS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxVersions: 10,
  maxProjects: 100,
  appName: 'Multi-Agent App Builder'
};

// Export as default object as well
export default {
  API_URL,
  SOCKET_URL,
  NODE_ENV,
  APP_VERSION,
  DEFAULT_CONFIGS
};
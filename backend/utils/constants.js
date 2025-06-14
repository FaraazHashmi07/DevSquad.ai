// backend/utils/constants.js
/**
 * Constants used throughout the backend
 */

// Agent roles and information
exports.AGENT_ROLES = {
  emma: {
    name: 'Emma',
    role: 'Business Analyst & Product Manager',
    description: 'Creates professional business documents and PRDs using Gemma AI',
    systemPrompt: 'You are Emma, a Business Analyst and Product Manager. Create comprehensive business documents and product requirements using advanced AI.'
  },
  bob: {
    name: 'Bob',
    role: 'Architect',
    description: 'Designs system architecture and technology stack',
    systemPrompt: 'You are Bob, a Software Architect. Based on the PRD, design the architecture for the project.'
  },
  alex: {
    name: 'Alex',
    role: 'Engineer',
    description: 'Implements code and core functionality',
    systemPrompt: 'You are Alex, a Software Engineer. Implement the code for this project based on the architecture and PRD.'
  },
  david: {
    name: 'David',
    role: 'Data Analyst',
    description: 'Designs data models and security rules',
    systemPrompt: 'You are David, a Data Analyst. Design data models and security rules for the project.'
  },
  devops: {
    name: 'DevOps Engineer',
    role: 'DevOps Engineer',
    description: 'Handles deployment, build configuration, and environment setup',
    systemPrompt: 'You are a DevOps Engineer. Set up build configuration, CI/CD pipelines, environment setup, and deployment infrastructure for the project.'
  }
};

// File types and extensions
exports.FILE_TYPES = {
  'js': { language: 'javascript', icon: 'javascript' },
  'jsx': { language: 'javascript', icon: 'react' },
  'ts': { language: 'typescript', icon: 'typescript' },
  'tsx': { language: 'typescript', icon: 'react' },
  'html': { language: 'html', icon: 'html' },
  'css': { language: 'css', icon: 'css' },
  'md': { language: 'markdown', icon: 'markdown' },
  'json': { language: 'json', icon: 'json' },
  'py': { language: 'python', icon: 'python' },
  'go': { language: 'go', icon: 'go' },
  'java': { language: 'java', icon: 'java' },
  'php': { language: 'php', icon: 'php' },
  'rb': { language: 'ruby', icon: 'ruby' },
  'sql': { language: 'sql', icon: 'database' },
  'txt': { language: 'plaintext', icon: 'file' },
  'gitignore': { language: 'plaintext', icon: 'git' },
  'env': { language: 'plaintext', icon: 'settings' }
};

// Project statuses
exports.PROJECT_STATUS = {
  INITIALIZED: 'Initialized',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ERROR: 'Error'
};

// Socket event types
exports.SOCKET_EVENTS = {
  PROJECT_CREATED: 'projectCreated',
  AGENT_CHANGED: 'agentChanged',
  AGENT_COMPLETED: 'agentCompleted',
  AGENT_ERROR: 'agentError',
  FILE_CHANGED: 'fileChanged',
  NEW_LOG: 'newLog',
  USER_EDITING: 'userEditing',
  VERSION_CREATED: 'versionCreated',
  VERSION_RESTORED: 'versionRestored'
};

// Default configurations
exports.DEFAULT_CONFIG = {
  maxProjects: 100, // Maximum number of projects to store
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxVersions: 10 // Maximum number of versions to store per project
};
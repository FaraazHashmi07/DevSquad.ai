/**
 * Constants used throughout the application
 */

// Agent configurations
export const AGENTS = {
  emma: {
    id: 'emma',
    name: 'Emma',
    role: 'Business Analyst & Product Manager',
    description: 'Creates professional business documents and PRDs using Gemma AI',
    color: 'bg-blue-500'
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    role: 'Architect',
    description: 'Designs system architecture and technology stack',
    color: 'bg-green-500'
  },
  alex: {
    id: 'alex',
    name: 'Alex',
    role: 'Engineer',
    description: 'Implements code and core functionality',
    color: 'bg-yellow-500'
  },
  david: {
    id: 'david',
    name: 'David',
    role: 'Data Analyst',
    description: 'Designs data models and security rules',
    color: 'bg-purple-500'
  },
  mike: {
    id: 'mike',
    name: 'Mike',
    role: 'Team Lead',
    description: 'Reviews output and creates documentation',
    color: 'bg-pink-500'
  }
};

// Socket events
export const SOCKET_EVENTS = {
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

// File types and icons
export const FILE_TYPES = {
  'js': { language: 'javascript', icon: '📄' },
  'jsx': { language: 'javascript', icon: '⚛️' },
  'ts': { language: 'typescript', icon: '📄' },
  'tsx': { language: 'typescript', icon: '⚛️' },
  'html': { language: 'html', icon: '🌐' },
  'css': { language: 'css', icon: '🎨' },
  'md': { language: 'markdown', icon: '📝' },
  'json': { language: 'json', icon: '🔧' },
  'py': { language: 'python', icon: '🐍' },
  'go': { language: 'go', icon: '🐹' },
  'java': { language: 'java', icon: '☕' },
  'php': { language: 'php', icon: '🐘' },
  'rb': { language: 'ruby', icon: '💎' },
  'rs': { language: 'rust', icon: '🦀' },
  'sql': { language: 'sql', icon: '🗄️' },
  'txt': { language: 'plaintext', icon: '📝' },
  'gitignore': { language: 'plaintext', icon: '🔍' },
  'env': { language: 'plaintext', icon: '🔒' }
};

// Project statuses
export const PROJECT_STATUS = {
  INITIALIZED: 'Initialized',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ERROR: 'Error'
};

// API endpoints
export const API_ENDPOINTS = {
  PROJECTS: '/projects',
  FILES: '/files',
  VERSIONS: '/versions',
  AGENTS: '/agents'
};

// Default editor options
export const EDITOR_DEFAULTS = {
  theme: 'vs-dark',
  fontSize: 14,
  tabSize: 2,
  minimap: { enabled: true },
  wordWrap: 'on',
  automaticLayout: true
};

// Local storage keys
export const STORAGE_KEYS = {
  RECENT_PROJECTS: 'multiagent_recent_projects',
  THEME_PREFERENCE: 'multiagent_theme'
};
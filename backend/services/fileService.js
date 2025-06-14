// backend/services/fileService.js
const fs = require('fs-extra');
const path = require('path');
const { nanoid } = require('nanoid');
const socketService = require('./socketService');

// Base directory for projects
const PROJECT_DIR = path.join(__dirname, '../data/projects');

/**
 * Initialize a new project
 * @param {string} projectId - Project unique identifier
 * @param {string} userPrompt - User's initial project prompt/description
 */
exports.initializeProject = async (projectId, userPrompt) => {
  const projectPath = path.join(PROJECT_DIR, projectId);
  
  // Create project directory structure
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'docs'));
  await fs.ensureDir(path.join(projectPath, 'versions'));
  
  // Create config file
  const configFile = {
    projectId,
    userPrompt,
    createdAt: new Date().toISOString(),
    status: 'Initialized',
    currentAgent: null
  };
  
  await fs.writeJson(path.join(projectPath, 'config.json'), configFile, { spaces: 2 });
  
  // Initialize log file
  await fs.writeFile(path.join(projectPath, 'log.txt'), `[${new Date().toISOString()}] Project initialized\n`);
  
  return projectId;
};

/**
 * Get project configuration data
 * @param {string} projectId - Project unique identifier
 * @returns {Object} - Project configuration data
 */
exports.getProjectData = async (projectId) => {
  const configPath = path.join(PROJECT_DIR, projectId, 'config.json');

  if (!(await fs.pathExists(configPath))) {
    throw new Error(`Project ${projectId} does not exist`);
  }

  return fs.readJson(configPath);
};

/**
 * Get list of files in a project
 * @param {string} projectId - Project unique identifier
 * @returns {Array} - List of files with metadata
 */
exports.getFileList = async (projectId) => {
  const projectPath = path.join(PROJECT_DIR, projectId);
  
  // Ensure project exists
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project ${projectId} does not exist`);
  }
  
  // Read all files recursively and create a file tree
  const fileTree = [];
  
  const buildFileTree = async (dir, basePath = '') => {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      // Skip system files, versions directory, and logs
      if (item.startsWith('.') || item === 'versions' || item === 'log.txt' || item === 'config.json') {
        continue;
      }
      
      const itemPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        const directory = {
          type: 'directory',
          name: item,
          path: relativePath,
          children: []
        };
        
        await buildFileTree(itemPath, relativePath);
        fileTree.push(directory);
      } else {
        fileTree.push({
          type: 'file',
          name: item,
          path: relativePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
  };
  
  await buildFileTree(projectPath);
  return fileTree;
};

/**
 * Read file content
 * @param {string} projectId - Project unique identifier
 * @param {string} filePath - Path to the file relative to project root
 * @returns {string} - File content
 */
exports.readFile = async (projectId, filePath) => {
  // Normalize file path and prevent directory traversal
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(PROJECT_DIR, projectId, normalizedPath);
  
  // Ensure path exists
  if (!(await fs.pathExists(fullPath))) {
    throw new Error(`File ${filePath} does not exist in project ${projectId}`);
  }
  
  // Read file content
  return fs.readFile(fullPath, 'utf-8');
};

/**
 * Write file content
 * @param {string} projectId - Project unique identifier
 * @param {string} filePath - Path to the file relative to project root
 * @param {string} content - File content to write
 * @param {string} agent - Name of the agent or user who made the change
 * @returns {string} - Path to the saved file
 */
exports.writeFile = async (projectId, filePath, content, agent = 'User') => {
  // Normalize file path and prevent directory traversal
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(PROJECT_DIR, projectId, normalizedPath);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(fullPath));
  
  // Write file
  await fs.writeFile(fullPath, content, 'utf-8');
  
  // Log the file change
  await this.appendToLog(projectId, `[${agent}] Created/updated file: ${normalizedPath}`);
  
  // Notify clients
  socketService.emitToProject(projectId, 'fileChanged', {
    projectId,
    path: normalizedPath,
    agent,
    action: 'write'
  });
  
  return normalizedPath;
};

/**
 * Delete a file
 * @param {string} projectId - Project unique identifier
 * @param {string} filePath - Path to the file relative to project root
 */
exports.deleteFile = async (projectId, filePath) => {
  // Normalize file path and prevent directory traversal
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(PROJECT_DIR, projectId, normalizedPath);
  
  // Ensure file exists
  if (!(await fs.pathExists(fullPath))) {
    throw new Error(`File ${filePath} does not exist in project ${projectId}`);
  }
  
  // Delete file
  await fs.remove(fullPath);
  
  // Log the file deletion
  await this.appendToLog(projectId, `[User] Deleted file: ${normalizedPath}`);
  
  // Notify clients
  socketService.emitToProject(projectId, 'fileChanged', {
    projectId,
    path: normalizedPath,
    action: 'delete'
  });
};

/**
 * Create a directory
 * @param {string} projectId - Project unique identifier
 * @param {string} dirPath - Path to the directory relative to project root
 */
exports.createDirectory = async (projectId, dirPath) => {
  // Normalize path and prevent directory traversal
  const normalizedPath = path.normalize(dirPath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(PROJECT_DIR, projectId, normalizedPath);
  
  // Create directory
  await fs.ensureDir(fullPath);
  
  // Log the directory creation
  await this.appendToLog(projectId, `[User] Created directory: ${normalizedPath}`);
  
  // Notify clients
  socketService.emitToProject(projectId, 'fileChanged', {
    projectId,
    path: normalizedPath,
    action: 'createDir'
  });
};

/**
 * Append to project log
 * @param {string} projectId - Project unique identifier
 * @param {string} message - Log message
 */
exports.appendToLog = async (projectId, message) => {
  const logPath = path.join(PROJECT_DIR, projectId, 'log.txt');
  
  // Create log file if it doesn't exist
  if (!(await fs.pathExists(logPath))) {
    await fs.writeFile(logPath, '');
  }
  
  // Append log entry
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  await fs.appendFile(logPath, logEntry);
  
  // Notify clients
  socketService.emitToProject(projectId, 'newLog', {
    projectId,
    timestamp,
    message
  });
};

/**
 * Read project logs
 * @param {string} projectId - Project unique identifier
 * @returns {Array} - Array of log entries
 */
exports.readLogs = async (projectId) => {
  const logPath = path.join(PROJECT_DIR, projectId, 'log.txt');
  
  if (!(await fs.pathExists(logPath))) {
    return [];
  }
  
  const logContent = await fs.readFile(logPath, 'utf-8');
  
  // Parse log entries
  const logEntries = logContent
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      // Extract timestamp and message
      const timestampMatch = line.match(/\[(.*?)\]/);
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        const message = line.substring(timestampMatch[0].length).trim();
        return { timestamp, message };
      }
      return { timestamp: '', message: line };
    });
  
  return logEntries;
};

/**
 * Create a project version snapshot
 * @param {string} projectId - Project unique identifier
 * @param {string} name - Version name
 * @returns {string} - Version ID
 */
exports.createSnapshot = async (projectId, name) => {
  const projectPath = path.join(PROJECT_DIR, projectId);
  const versionId = nanoid(10);
  const versionPath = path.join(projectPath, 'versions', versionId);
  
  // Create version directory
  await fs.ensureDir(versionPath);
  
  // Create version metadata
  const metadata = {
    id: versionId,
    name: name || `Snapshot ${new Date().toISOString()}`,
    timestamp: new Date().toISOString(),
    createdBy: 'User'
  };
  
  await fs.writeJson(path.join(versionPath, 'metadata.json'), metadata, { spaces: 2 });
  
  // Copy all files except versions directory, logs, and config
  await copyDirectoryWithExclusions(projectPath, versionPath, ['versions', 'log.txt', 'config.json']);
  
  // Log version creation
  await this.appendToLog(projectId, `Created version snapshot: ${metadata.name} (${versionId})`);
  
  return versionId;
};

/**
 * Get all versions of a project
 * @param {string} projectId - Project unique identifier
 * @returns {Array} - List of versions with metadata
 */
exports.getVersions = async (projectId) => {
  const versionsPath = path.join(PROJECT_DIR, projectId, 'versions');
  
  if (!(await fs.pathExists(versionsPath))) {
    return [];
  }
  
  const versionDirs = await fs.readdir(versionsPath);
  const versions = [];
  
  for (const versionId of versionDirs) {
    try {
      const metadataPath = path.join(versionsPath, versionId, 'metadata.json');
      
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        versions.push(metadata);
      }
    } catch (error) {
      console.error(`Error reading version ${versionId}:`, error);
    }
  }
  
  // Sort by timestamp (newest first)
  versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return versions;
};

/**
 * Get a specific version
 * @param {string} projectId - Project unique identifier
 * @param {string} versionId - Version unique identifier
 * @returns {Object} - Version metadata and files
 */
exports.getVersion = async (projectId, versionId) => {
  const versionPath = path.join(PROJECT_DIR, projectId, 'versions', versionId);
  const metadataPath = path.join(versionPath, 'metadata.json');
  
  if (!(await fs.pathExists(metadataPath))) {
    throw new Error(`Version ${versionId} does not exist in project ${projectId}`);
  }
  
  const metadata = await fs.readJson(metadataPath);
  
  // Get file list for this version
  const files = [];
  
  const scanDir = async (dir, basePath = '') => {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      // Skip metadata file
      if (item === 'metadata.json') {
        continue;
      }
      
      const itemPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        await scanDir(itemPath, relativePath);
      } else {
        files.push({
          path: relativePath,
          size: stats.size
        });
      }
    }
  };
  
  await scanDir(versionPath);
  
  return {
    ...metadata,
    files
  };
};

/**
 * Restore a project to a specific version
 * @param {string} projectId - Project unique identifier
 * @param {string} versionId - Version unique identifier
 * @returns {Object} - Version metadata
 */
exports.restoreVersion = async (projectId, versionId) => {
  const projectPath = path.join(PROJECT_DIR, projectId);
  const versionPath = path.join(projectPath, 'versions', versionId);
  const metadataPath = path.join(versionPath, 'metadata.json');
  
  if (!(await fs.pathExists(metadataPath))) {
    throw new Error(`Version ${versionId} does not exist in project ${projectId}`);
  }
  
  const metadata = await fs.readJson(metadataPath);
  
  // Create a snapshot of the current state before restoring
  await this.createSnapshot(projectId, 'Auto-snapshot before restore');
  
  // Delete all current files except versions directory, logs, and config
  const currentFiles = await fs.readdir(projectPath);
  for (const file of currentFiles) {
    if (file !== 'versions' && file !== 'log.txt' && file !== 'config.json') {
      await fs.remove(path.join(projectPath, file));
    }
  }
  
  // Copy all files from version back to project
  await copyDirectoryWithExclusions(versionPath, projectPath, ['metadata.json']);
  
  // Log version restoration
  await this.appendToLog(projectId, `Restored to version: ${metadata.name} (${versionId})`);
  
  return metadata;
};

/**
 * Helper function to copy a directory with exclusions
 * @param {string} source - Source directory
 * @param {string} target - Target directory
 * @param {Array} exclusions - List of files/directories to exclude
 */
async function copyDirectoryWithExclusions(source, target, exclusions = []) {
  // Create target directory if it doesn't exist
  await fs.ensureDir(target);
  
  // Get all items in source directory
  const items = await fs.readdir(source);
  
  for (const item of items) {
    // Skip excluded items
    if (exclusions.includes(item)) {
      continue;
    }
    
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stats = await fs.stat(sourcePath);
    
    if (stats.isDirectory()) {
      // Recursively copy directory
      await copyDirectoryWithExclusions(sourcePath, targetPath, exclusions);
    } else {
      // Copy file
      await fs.copy(sourcePath, targetPath);
    }
  }
}
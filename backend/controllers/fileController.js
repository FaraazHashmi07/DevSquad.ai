// backend/controllers/fileController.js
const fileService = require('../services/fileService');

/**
 * Get list of all files in a project
 */
exports.getFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }
    
    const files = await fileService.getFileList(projectId);
    res.json(files);
  } catch (error) {
    next(error);
  }
};

/**
 * Get file content
 */
exports.getFileContent = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path } = req.query;
    
    if (!projectId || !path) {
      return res.status(400).json({
        error: 'Project ID and file path are required'
      });
    }
    
    const content = await fileService.readFile(projectId, path);
    res.json({ content });
  } catch (error) {
    next(error);
  }
};

/**
 * Save file content
 */
exports.saveFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path, content, agent } = req.body;
    
    if (!projectId || !path || content === undefined) {
      return res.status(400).json({
        error: 'Project ID, file path, and content are required'
      });
    }
    
    const savedPath = await fileService.writeFile(projectId, path, content, agent || 'User');
    res.json({ path: savedPath });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a file
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path } = req.query;
    
    if (!projectId || !path) {
      return res.status(400).json({
        error: 'Project ID and file path are required'
      });
    }
    
    await fileService.deleteFile(projectId, path);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a directory
 */
exports.createDirectory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { path } = req.body;
    
    if (!projectId || !path) {
      return res.status(400).json({
        error: 'Project ID and directory path are required'
      });
    }
    
    await fileService.createDirectory(projectId, path);
    res.json({ message: 'Directory created successfully', path });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project logs
 */
exports.getLogs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }
    
    const logs = await fileService.readLogs(projectId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
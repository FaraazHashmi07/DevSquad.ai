// backend/controllers/versionController.js
const fileService = require('../services/fileService');
const socketService = require('../services/socketService');

/**
 * Get all versions of a project
 */
exports.getVersions = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }
    
    const versions = await fileService.getVersions(projectId);
    res.json(versions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific version
 */
exports.getVersion = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { versionId } = req.query;
    
    if (!projectId || !versionId) {
      return res.status(400).json({
        error: 'Project ID and Version ID are required'
      });
    }
    
    const version = await fileService.getVersion(projectId, versionId);
    res.json(version);
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a project to a specific version
 */
exports.restoreVersion = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { versionId } = req.body;
    
    if (!projectId || !versionId) {
      return res.status(400).json({
        error: 'Project ID and Version ID are required'
      });
    }
    
    const version = await fileService.restoreVersion(projectId, versionId);
    
    // Notify clients
    socketService.emitToProject(projectId, 'versionRestored', {
      projectId,
      versionId,
      name: version.name
    });
    
    res.json({
      message: `Project restored to version: ${version.name}`,
      versionId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new version
 */
exports.createVersion = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }
    
    const versionId = await fileService.createSnapshot(projectId, name);
    
    // Notify clients
    socketService.emitToProject(projectId, 'versionCreated', {
      projectId,
      versionId,
      name: name || `Snapshot ${new Date().toISOString()}`
    });
    
    res.json({
      message: 'Version created successfully',
      versionId
    });
  } catch (error) {
    next(error);
  }
};
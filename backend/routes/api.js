// backend/routes/api.js
const express = require('express');
const router = express.Router();

// Import controllers
const projectController = require('../controllers/projectController');
const agentController = require('../controllers/agentController');
const fileController = require('../controllers/fileController');
const versionController = require('../controllers/versionController');

// Project routes
router.post('/projects', projectController.createProject);
router.get('/projects', projectController.getProjects);
router.get('/projects/:projectId', projectController.getProject);

// Agent routes
router.post('/projects/:projectId/agents/:agentName', agentController.runAgentHandler);

// File routes
router.get('/projects/:projectId/files', fileController.getFiles);
router.get('/projects/:projectId/file', fileController.getFileContent);
router.post('/projects/:projectId/file', fileController.saveFile);
router.delete('/projects/:projectId/file', fileController.deleteFile);
router.post('/projects/:projectId/directory', fileController.createDirectory);
router.get('/projects/:projectId/logs', fileController.getLogs);

// Version routes
router.get('/projects/:projectId/versions', versionController.getVersions);
router.get('/projects/:projectId/version', versionController.getVersion);
router.post('/projects/:projectId/version', versionController.createVersion);
router.post('/projects/:projectId/restore', versionController.restoreVersion);

module.exports = router;
// backend/controllers/projectController.js
const { nanoid } = require('nanoid');
const fileService = require('../services/fileService');
const socketService = require('../services/socketService');

/**
 * Create a new project
 */
exports.createProject = async (req, res, next) => {
  try {
    const { userPrompt } = req.body;
    
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim() === '') {
      return res.status(400).json({
        error: 'User prompt is required'
      });
    }
    
    // Generate project ID
    const projectId = nanoid(10);
    
    // Initialize project
    await fileService.initializeProject(projectId, userPrompt);
    
    // Notify clients
    socketService.emitToAll('projectCreated', {
      projectId,
      userPrompt
    });
    
    // Return project ID
    res.status(201).json({
      projectId,
      message: 'Project created successfully'
    });
    
    // Start Emma (PM) agent asynchronously
    // In a real implementation, we would trigger the PM agent here
    setTimeout(async () => {
      try {
        await fileService.appendToLog(projectId, 'Emma (PM) has started working on the PRD...');
        socketService.emitToProject(projectId, 'agentChanged', {
          projectId,
          agent: 'emma',
          status: 'Emma (PM) is working on the PRD...'
        });
      } catch (error) {
        console.error('Error starting PM agent:', error);
      }
    }, 1000);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a list of all projects
 */
exports.getProjects = async (req, res, next) => {
  try {
    // Get all project directories
    const fs = require('fs-extra');
    const path = require('path');
    
    const projectsDir = path.join(__dirname, '../data/projects');
    const projectDirs = await fs.readdir(projectsDir);
    
    const projects = [];
    
    // Get project info from config.json for each project
    for (const projectId of projectDirs) {
      try {
        const configPath = path.join(projectsDir, projectId, 'config.json');
        
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          projects.push({
            projectId,
            userPrompt: config.userPrompt,
            createdAt: config.createdAt,
            status: config.status,
            currentAgent: config.currentAgent
          });
        }
      } catch (error) {
        console.error(`Error reading project ${projectId}:`, error);
      }
    }
    
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific project
 */
exports.getProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Project ID is required'
      });
    }
    
    const fs = require('fs-extra');
    const path = require('path');
    
    const projectDir = path.join(__dirname, '../data/projects', projectId);
    const configPath = path.join(projectDir, 'config.json');
    
    if (!(await fs.pathExists(configPath))) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }
    
    const config = await fs.readJson(configPath);
    
    res.json({
      projectId,
      userPrompt: config.userPrompt,
      createdAt: config.createdAt,
      status: config.status,
      currentAgent: config.currentAgent
    });
  } catch (error) {
    next(error);
  }
};
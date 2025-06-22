import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import socketIOClient from 'socket.io-client';

// Create context
export const ProjectContext = createContext();

// Import config
import { API_URL, SOCKET_URL } from '../config';

export const ProjectProvider = ({ children }) => {
  // State for project data
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [logs, setLogs] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [agentStatus, setAgentStatus] = useState('');

  // Calculate if all agents have completed by checking logs
  const allAgentsCompleted = useMemo(() => {
    if (!currentProject || !logs || logs.length === 0) {
      return false;
    }

    // Check for completion messages from all 5 agents
    const agentCompletionPatterns = [
      'Emma has completed their task',
      'Bob has completed their task',
      'David has completed their task',
      'Alex has completed their task',
      'DevOps Engineer has completed their task'
    ];

    const completedAgents = agentCompletionPatterns.filter(pattern =>
      logs.some(log => log.message && log.message.includes(pattern))
    );

    // All 5 agents must have completed
    return completedAgents.length === 5;
  }, [currentProject, logs]);

  // Connect to socket.io when the component mounts
  useEffect(() => {
    const socketIO = socketIOClient(SOCKET_URL);

    socketIO.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketIO.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    setSocket(socketIO);

    // Clean up the socket connection when the component unmounts
    return () => {
      socketIO.disconnect();
    };
  }, []);

  // Handle project-specific socket events
  useEffect(() => {
    if (!socket || !currentProject) return;

    // Join project room when a project is selected
    socket.emit('joinProject', currentProject.projectId);

    // Set up event listeners for this project
    socket.on('agentChanged', ({ agent, status }) => {
      setCurrentAgent(agent);
      setAgentStatus(status);
    });

    socket.on('fileChanged', async ({ path, action }) => {
      // Refresh file list when files change
      fetchFiles(currentProject.projectId);

      // If the current file was changed, reload its content
      if (currentFile && path === currentFile.path) {
        fetchFileContent(currentProject.projectId, currentFile.path);
      }
    });

    socket.on('newLog', ({ message, timestamp }) => {
      setLogs(prevLogs => [...prevLogs, { message, timestamp }]);
    });

    socket.on('versionCreated', ({ versionId, name }) => {
      fetchVersions(currentProject.projectId);
    });

    socket.on('versionRestored', ({ versionId }) => {
      fetchVersions(currentProject.projectId);
      fetchFiles(currentProject.projectId);
    });

    socket.on('agentCompleted', ({ agent, agentName }) => {
      console.log(`Agent ${agentName} completed`);
      // Refresh logs to show completion
      fetchLogs(currentProject.projectId);
    });

    socket.on('workflowCompleted', ({ message, completedAgents }) => {
      console.log('Workflow completed:', message);
      setAgentStatus('Project created successfully');
      // Refresh logs to show completion message
      fetchLogs(currentProject.projectId);
    });

    // Clean up event listeners when the component unmounts or when the project changes
    return () => {
      socket.emit('leaveProject', currentProject.projectId);
      socket.off('agentChanged');
      socket.off('fileChanged');
      socket.off('newLog');
      socket.off('versionCreated');
      socket.off('versionRestored');
      socket.off('agentCompleted');
      socket.off('workflowCompleted');
    };
  }, [socket, currentProject, currentFile]);

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/projects`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const createProject = async (userPrompt) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const data = await response.json();
      await fetchProjects();
      return data.projectId;
    } catch (err) {
      setError(err.message);
      console.error('Error creating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load a specific project
  const loadProject = async (projectId) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔧 Loading project:', projectId);
      const response = await fetch(`${API_URL}/projects/${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const project = await response.json();
      console.log('🔧 Project loaded:', project);
      setCurrentProject(project);

      // Load project files and logs
      await fetchFiles(projectId);
      await fetchLogs(projectId);
      await fetchVersions(projectId);

      setCurrentAgent(project.currentAgent);
      setAgentStatus(project.status);

      console.log('🔧 Project context set, projectId:', project.projectId);
      return project;
    } catch (err) {
      setError(err.message);
      console.error('Error loading project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch files for a project
  const fetchFiles = async (projectId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/files`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch file content
  const fetchFileContent = async (projectId, filePath) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/file?path=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      
      const data = await response.json();
      setFileContent(data.content);
      return data.content;
    } catch (err) {
      console.error('Error fetching file content:', err);
      return '';
    } finally {
      setLoading(false);
    }
  };

  // Save file content
  const saveFile = async (projectId, filePath, content) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          path: filePath, 
          content,
          agent: 'User'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save file');
      }
      
      // Refresh file list
      fetchFiles(projectId);
      return true;
    } catch (err) {
      console.error('Error saving file:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch project logs
  const fetchLogs = async (projectId) => {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/logs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  // Fetch project versions
  const fetchVersions = async (projectId) => {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/versions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  };

  // Create a new version
  const createVersion = async (projectId, name) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create version');
      }
      
      // Refresh versions list
      fetchVersions(projectId);
      return true;
    } catch (err) {
      console.error('Error creating version:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Restore a version
  const restoreVersion = async (projectId, versionId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore version');
      }
      
      // Refresh files and versions lists
      fetchFiles(projectId);
      fetchVersions(projectId);
      return true;
    } catch (err) {
      console.error('Error restoring version:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Run an agent
  const runAgent = async (agentName) => {
    console.log('🔧 runAgent called with:', agentName);
    console.log('🔧 currentProject:', currentProject);
    console.log('🔧 currentProject?.projectId:', currentProject?.projectId);

    if (!currentProject?.projectId) {
      const errorMsg = `No project selected. currentProject: ${currentProject ? 'exists but no projectId' : 'null'}`;
      console.error('🔧 runAgent error:', errorMsg);
      setError(errorMsg);
      return false;
    }

    setLoading(true);

    try {
      console.log('🔧 Starting agent:', agentName, 'for project:', currentProject.projectId);
      const response = await fetch(`${API_URL}/projects/${currentProject.projectId}/agents/${agentName}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to run agent: ${agentName}`);
      }

      console.log('🔧 Agent started successfully:', agentName);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error running agent:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Automatically start workflow for a project
  const startWorkflow = async (projectId) => {
    console.log('🔧 startWorkflow called for project:', projectId);

    // Use the projectId directly instead of relying on currentProject state
    const startEmma = async () => {
      try {
        console.log('🔧 Starting Emma for project:', projectId);
        const response = await fetch(`${API_URL}/projects/${projectId}/agents/emma`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start Emma');
        }

        console.log('🔧 Emma started successfully for project:', projectId);
        return true;
      } catch (err) {
        console.error('Error starting Emma:', err);
        setError(err.message);
        return false;
      }
    };

    // Small delay to ensure project is fully loaded, then start Emma
    setTimeout(startEmma, 1000);
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        files,
        currentFile,
        setCurrentFile,
        fileContent,
        logs,
        versions,
        loading,
        error,
        currentAgent,
        agentStatus,
        allAgentsCompleted,
        fetchProjects,
        createProject,
        loadProject,
        fetchFiles,
        fetchFileContent,
        saveFile,
        fetchLogs,
        createVersion,
        restoreVersion,
        runAgent,
        startWorkflow,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import TeamBar from './components/TeamBar/TeamBar';
import FileExplorer from './components/FileExplorer/FileExplorer';
import CodeEditor from './components/Editor/CodeEditor';
import WordDocumentViewer from './components/Viewer/WordDocumentViewer';
import PresentationViewer from './components/Viewer/PresentationViewer';
import ConsoleLog from './components/Console/ConsoleLog';
import VersionModal from './components/Versioning/VersionModal';

// Main application
function AppContent() {
  const {
    currentProject,
    projects,
    files,
    currentFile,
    setCurrentFile,
    fileContent,
    logs,
    loading,
    error,
    fetchProjects,
    createProject,
    loadProject,
    fetchFileContent,
    saveFile,
    createVersion,
  } = useProject();

  const [userPrompt, setUserPrompt] = useState('');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Fetch projects on initial load
  useEffect(() => {
    fetchProjects();
  }, []);

  // Update editor content when file content changes
  useEffect(() => {
    setEditorContent(fileContent || '');
    setIsDirty(false);
  }, [fileContent]);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (isDirty && currentFile) {
      // Ask the user if they want to save changes
      const confirmSave = window.confirm('You have unsaved changes. Save before switching files?');
      if (confirmSave) {
        await saveFile(currentProject.projectId, currentFile.path, editorContent);
      }
    }

    setCurrentFile(file);
    if (file) {
      fetchFileContent(currentProject.projectId, file.path);
    }
  };

  // Handle editor content change
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setIsDirty(true);
  };

  // Save current file
  const handleSaveFile = async () => {
    if (currentFile && currentProject) {
      await saveFile(currentProject.projectId, currentFile.path, editorContent);
      setIsDirty(false);
    }
  };

  // Create a new project
  const handleCreateProject = async () => {
    if (!userPrompt.trim()) {
      alert('Please enter a description for your project.');
      return;
    }

    const projectId = await createProject(userPrompt);
    if (projectId) {
      await loadProject(projectId);
      setUserPrompt('');
    }
  };

  // Load an existing project
  const handleLoadProject = async (projectId) => {
    await loadProject(projectId);
  };

  // Create a new version
  const handleCreateVersion = async () => {
    if (!currentProject) return;
    
    const name = prompt('Enter a name for this version:');
    if (name) {
      await createVersion(currentProject.projectId, name);
      // Close the modal after creating a version
      setIsVersionModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Multi-Agent App Builder</h1>
          {currentProject && (
            <div className="flex items-center space-x-2">
              <button
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => setIsVersionModalOpen(true)}
              >
                Versions
              </button>
              <span className="text-sm">
                Project: <span className="font-semibold">{currentProject.projectId}</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow flex overflow-hidden">
        {!currentProject ? (
          /* Project selection / creation */
          <div className="container mx-auto p-6 flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-center">Create a New Project</h2>
              <div className="mb-6">
                <label htmlFor="projectPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your project description:
                </label>
                <textarea
                  id="projectPrompt"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="e.g., Create a React + Firebase chat app with login and admin dashboard"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-center">
                <button
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-md"
                  onClick={handleCreateProject}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Start Building'}
                </button>
              </div>
              
              {projects.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold mb-4">Your Projects</h3>
                  <div className="overflow-auto max-h-60">
                    <ul className="space-y-2">
                      {projects.map((project) => (
                        <li 
                          key={project.projectId}
                          className="bg-gray-50 hover:bg-gray-100 p-3 rounded-md cursor-pointer"
                          onClick={() => handleLoadProject(project.projectId)}
                        >
                          <div className="font-medium">{project.projectId}</div>
                          <div className="text-sm text-gray-600 truncate">{project.userPrompt}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created: {new Date(project.createdAt).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Project workspace */
          <>
            {/* Team sidebar */}
            <div className="w-16 bg-gray-900 flex-shrink-0">
              <TeamBar />
            </div>
            
            {/* File explorer */}
            <div className="w-64 bg-gray-800 flex-shrink-0">
              <FileExplorer 
                files={files} 
                currentFile={currentFile} 
                onFileSelect={handleFileSelect} 
              />
            </div>
            
            {/* Editor and Console */}
            <div className="flex-grow flex flex-col">
              {/* Editor area */}
              <div className="flex-grow">
                {/* Check file type and render appropriate viewer */}
                {currentFile?.path?.includes('Word') && currentFile?.path?.endsWith('.html') ? (
                  <WordDocumentViewer
                    content={editorContent}
                    fileName={currentFile?.name}
                  />
                ) : currentFile?.path?.includes('Presentation') && currentFile?.path?.endsWith('.html') ? (
                  <PresentationViewer
                    content={editorContent}
                    fileName={currentFile?.name}
                  />
                ) : (
                  <CodeEditor
                    value={editorContent}
                    onChange={handleEditorChange}
                    language={currentFile?.path?.split('.').pop() || 'plaintext'}
                    onSave={handleSaveFile}
                    isDirty={isDirty}
                  />
                )}
              </div>
              
              {/* Console logs */}
              <div className="h-1/3 border-t border-gray-300">
                <ConsoleLog logs={logs} />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Version modal */}
      {isVersionModalOpen && (
        <VersionModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          onCreateVersion={handleCreateVersion}
        />
      )}
      
      {/* Error notification */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg">
          {error}
          <button 
            className="ml-4 font-bold"
            onClick={() => { /* This would use context's setError but we're accessing error through destructured props */ }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
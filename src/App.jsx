import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import TeamBar from './components/TeamBar/TeamBar';
import FileExplorer from './components/FileExplorer/FileExplorer';
import CodeEditor from './components/Editor/CodeEditor';
import WordDocumentViewer from './components/Viewer/WordDocumentViewer';
import PresentationViewer from './components/Viewer/PresentationViewer';
import ConsoleLog from './components/Console/ConsoleLog';
import VersionModal from './components/Versioning/VersionModal';
import LivePreview from './components/Preview/LivePreview';
import ResizeHandle from './components/Preview/ResizeHandle';

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
    allAgentsCompleted,
    fetchProjects,
    createProject,
    loadProject,
    fetchFileContent,
    saveFile,
    createVersion,
    runAgent,
    startWorkflow,
  } = useProject();

  const [userPrompt, setUserPrompt] = useState('');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Debug: Track state changes
  useEffect(() => {
    console.log('🔧 isPreviewVisible state changed to:', isPreviewVisible);
  }, [isPreviewVisible]);
  const [editorWidth, setEditorWidth] = useState(50); // Percentage width for editor when preview is visible

  // Predefined prompts for different website types
  const predefinedPrompts = [
    {
      id: 'jewelry',
      title: 'Jewelry E-commerce',
      icon: '💎',
      prompt: 'Create a luxury jewelry store with diamond rings, necklaces, and shopping cart functionality',
      description: 'Elegant e-commerce site for luxury jewelry',
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'photography',
      title: 'Photography Portfolio',
      icon: '📸',
      prompt: 'Build a photography portfolio showcasing wedding, portrait, and landscape photography with gallery',
      description: 'Professional portfolio for photographers',
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'restaurant',
      title: 'Restaurant Website',
      icon: '🍽️',
      prompt: 'Create a restaurant website with online menu, reservations, and contact information',
      description: 'Complete restaurant website with menu system',
      gradient: 'from-orange-500 to-red-500',
      hoverGradient: 'from-orange-600 to-red-600'
    },
    {
      id: 'blog',
      title: 'Blog Platform',
      icon: '📝',
      prompt: 'Build a tech blog with article categories, search functionality, and content management',
      description: 'Modern blog platform with CMS features',
      gradient: 'from-green-500 to-teal-500',
      hoverGradient: 'from-green-600 to-teal-600'
    },
    {
      id: 'fitness',
      title: 'Fitness Tracking',
      icon: '💪',
      prompt: 'Create a fitness tracking app with workout plans, nutrition calculator, and progress tracking',
      description: 'Comprehensive fitness tracking platform',
      gradient: 'from-red-500 to-pink-500',
      hoverGradient: 'from-red-600 to-pink-600'
    },
    {
      id: 'consulting',
      title: 'Business Consulting',
      icon: '🚀',
      prompt: 'Design a business consulting website with services, team profiles, and case studies',
      description: 'Professional consulting firm website',
      gradient: 'from-indigo-500 to-purple-500',
      hoverGradient: 'from-indigo-600 to-purple-600'
    }
  ];

  // AI Agents information
  const aiAgents = [
    {
      id: 'emma',
      name: 'Emma',
      role: 'Business Analyst',
      icon: '📊',
      description: 'Analyzes market requirements and creates comprehensive business strategies',
      color: 'from-blue-500 to-indigo-600',
      expertise: ['Market Research', 'Business Strategy', 'Requirements Analysis']
    },
    {
      id: 'bob',
      name: 'Bob',
      role: 'Software Architect',
      icon: '🏗️',
      description: 'Designs technical architecture and system blueprints',
      color: 'from-purple-500 to-violet-600',
      expertise: ['System Design', 'Architecture', 'Technical Planning']
    },
    {
      id: 'david',
      name: 'David',
      role: 'Data Analyst',
      icon: '📈',
      description: 'Creates data structures and manages information architecture',
      color: 'from-green-500 to-emerald-600',
      expertise: ['Data Modeling', 'Analytics', 'Database Design']
    },
    {
      id: 'alex',
      name: 'Alex',
      role: 'Full-Stack Developer',
      icon: '💻',
      description: 'Builds complete applications with modern frameworks and technologies',
      color: 'from-orange-500 to-red-600',
      expertise: ['React Development', 'Backend APIs', 'UI/UX Implementation']
    },
    {
      id: 'devops',
      name: 'DevOps Engineer',
      role: 'DevOps Engineer',
      icon: '⚙️',
      description: 'Handles deployment, configuration, and development environment setup',
      color: 'from-cyan-500 to-blue-600',
      expertise: ['CI/CD', 'Deployment', 'Infrastructure']
    }
  ];

  // Fetch projects on initial load
  useEffect(() => {
    fetchProjects();
  }, []);

  // Update editor content when file content changes
  useEffect(() => {
    setEditorContent(fileContent || '');
    setIsDirty(false);
  }, [fileContent]);

  // Auto-show preview when all agents complete (only once)
  useEffect(() => {
    if (allAgentsCompleted && !isPreviewVisible) {
      console.log('🔧 Auto-showing preview because all agents completed');
      setIsPreviewVisible(true);
      // Reset editor width to default when auto-showing preview
      setEditorWidth(50);
    }
  }, [allAgentsCompleted]); // Removed isPreviewVisible dependency to prevent interference

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

    console.log('🔧 Creating project with prompt:', userPrompt);
    const projectId = await createProject(userPrompt);
    if (projectId) {
      console.log('🔧 Project created, loading:', projectId);
      const project = await loadProject(projectId);
      if (project) {
        console.log('🔧 Project loaded, starting workflow');
        // Start the automatic workflow
        await startWorkflow(projectId);
      }
      setUserPrompt('');
    }
  };

  // Handle predefined prompt click
  const handlePredefinedPromptClick = async (prompt) => {
    setUserPrompt(prompt);

    console.log('🔧 Creating project with predefined prompt:', prompt);
    const projectId = await createProject(prompt);
    if (projectId) {
      console.log('🔧 Project created, loading:', projectId);
      const project = await loadProject(projectId);
      if (project) {
        console.log('🔧 Project loaded, starting workflow');
        // Start the automatic workflow
        await startWorkflow(projectId);
      }
      setUserPrompt('');
    }
  };

  // Load an existing project
  const handleLoadProject = async (projectId) => {
    console.log('🔧 Loading existing project:', projectId);
    const project = await loadProject(projectId);
    if (project) {
      console.log('🔧 Existing project loaded successfully');
      // For existing projects, check if workflow should continue
      // Only start workflow if no agents have completed yet
      if (!project.currentAgent || project.currentAgent === 'emma') {
        console.log('🔧 Starting workflow for existing project');
        await startWorkflow(projectId);
      }
    }
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

  // Toggle preview window
  const togglePreview = () => {
    console.log('🔧 togglePreview called - Current isPreviewVisible:', isPreviewVisible);

    // Use functional state update to ensure we get the latest state
    setIsPreviewVisible(prevState => {
      const newValue = !prevState;
      console.log('🔧 togglePreview - Changing from', prevState, 'to', newValue);
      return newValue;
    });
  };

  // Handle resize of editor/preview split
  const handleResize = (newEditorWidth) => {
    setEditorWidth(newEditorWidth);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white p-4 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🤖</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              DevSquad.ai
            </h1>
          </div>
          {currentProject && (
            <div className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  allAgentsCompleted || isPreviewVisible
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                onClick={(allAgentsCompleted || isPreviewVisible) ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔧 Header button clicked - allAgentsCompleted:', allAgentsCompleted, 'isPreviewVisible:', isPreviewVisible);
                  // Use setTimeout to ensure click event is fully processed
                  setTimeout(() => {
                    togglePreview();
                  }, 0);
                } : undefined}
                disabled={!allAgentsCompleted && !isPreviewVisible}
                title={
                  isPreviewVisible
                    ? 'Hide Live Preview'
                    : allAgentsCompleted
                      ? 'Show Live Preview'
                      : 'Preview available after all agents complete'
                }
              >
                {isPreviewVisible ? '🔍 Hide Preview' : '🔍 Live Preview'}
              </button>
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
      <div className="flex-grow flex overflow-hidden min-h-0">
        {!currentProject ? (
          /* Project selection / creation */
          <div className="container mx-auto p-6 flex flex-col items-center justify-start overflow-y-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 max-w-4xl">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent mb-6">
                Build Your Dream Website
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our AI-powered multi-agent system creates professional websites in minutes.
                From business analysis to deployment, our specialized agents work together to bring your vision to life.
              </p>
            </div>

            {/* Meet Our AI Agents Section */}
            <div className="w-full max-w-7xl mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Meet Our AI Agents</h3>
                <p className="text-lg text-gray-600">Five specialized AI agents working in perfect harmony</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {aiAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 p-6 border border-gray-100"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                    <div className="relative z-10 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
                        {agent.icon}
                      </div>

                      <h4 className="text-xl font-bold text-gray-800 mb-1">{agent.name}</h4>
                      <p className="text-sm font-medium text-gray-500 mb-3">{agent.role}</p>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{agent.description}</p>

                      <div className="space-y-1">
                        {agent.expertise.map((skill, skillIndex) => (
                          <div key={skillIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full inline-block mr-1 mb-1">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Project Creation Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-6xl border border-gray-100">
              <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Start Building Your Project</h2>

              {/* Predefined Prompts Section */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">Quick Start Templates</h3>
                <p className="text-center text-gray-600 mb-8">Choose from our popular website types and get started instantly</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {predefinedPrompts.map((template, index) => (
                    <div
                      key={template.id}
                      className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
                      onClick={() => handlePredefinedPromptClick(template.prompt)}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${template.gradient} flex items-center justify-center text-3xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {template.icon}
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2 text-lg group-hover:text-gray-900">{template.title}</h4>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{template.description}</p>

                        {/* Try This Badge */}
                        <div className="inline-flex items-center space-x-2 mb-4">
                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                            ✨ Try This
                          </span>
                        </div>

                        <button className={`w-full bg-gradient-to-r ${template.gradient} hover:bg-gradient-to-r hover:${template.hoverGradient} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl`}>
                          Create Now
                        </button>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-white/20 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-white/20 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center mb-8">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-6 text-gray-400 text-sm font-medium bg-white">OR CREATE CUSTOM</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Custom Prompt Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">Custom Project</h3>
                <p className="text-center text-gray-600 mb-6">Describe your dream website and watch our AI agents bring it to life</p>

                <div className="relative">
                  <label htmlFor="projectPrompt" className="block text-sm font-semibold text-gray-700 mb-3">
                    🎯 Describe your project:
                  </label>
                  <div className="relative">
                    <textarea
                      id="projectPrompt"
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none shadow-sm hover:shadow-md text-gray-700 placeholder-gray-400"
                      rows={4}
                      placeholder="Describe your dream website... ✨

Examples:
• Create a modern e-commerce store for handmade crafts
• Build a portfolio website for a digital marketing agency
• Design a booking platform for fitness classes
• Make a calculator with advanced mathematical functions"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                    ></textarea>

                    {/* Character count or helpful hint */}
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {userPrompt.length > 0 ? `${userPrompt.length} characters` : 'Start typing...'}
                    </div>
                  </div>

                  {/* Helpful hints */}
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p>💡 <strong>Pro tip:</strong> Be specific about features, design style, and target audience for best results</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  onClick={handleCreateProject}
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Magic...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Start Building</span>
                      </>
                    )}
                  </span>

                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
              
              {projects.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Recent Projects</h3>
                  <div className="overflow-auto max-h-80">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.slice(0, 6).map((project, index) => (
                        <div
                          key={project.projectId}
                          className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-300 p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                          onClick={() => handleLoadProject(project.projectId)}
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {project.projectId.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors truncate">
                                {project.projectId}
                              </div>
                              <div className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                {project.userPrompt}
                              </div>
                              <div className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                                <span>📅</span>
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Hover indicator */}
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="text-xs text-indigo-600 font-medium">Click to open →</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {projects.length > 6 && (
                      <div className="text-center mt-6">
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                          View all {projects.length} projects →
                        </button>
                      </div>
                    )}
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

            {/* Main Content Area */}
            <div className="flex-grow flex flex-row overflow-hidden">
              {/* Editor and Console Section */}
              <div
                className="flex flex-col transition-all duration-300"
                style={{
                  width: isPreviewVisible ? `${editorWidth}%` : '100%'
                }}
              >
                {/* Editor area */}
                <div className="flex-grow overflow-hidden">
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
                <div className="h-64 border-t border-gray-300 flex-shrink-0">
                  <ConsoleLog logs={logs} />
                </div>
              </div>

              {/* Resize Handle */}
              {isPreviewVisible && (
                <ResizeHandle
                  onResize={handleResize}
                  initialWidth={editorWidth}
                />
              )}

              {/* Preview Window */}
              {isPreviewVisible && (
                <div
                  className="flex-shrink-0 transition-all duration-300"
                  style={{
                    width: `${100 - editorWidth}%`
                  }}
                >
                  <LivePreview
                    key={`preview-${isPreviewVisible}`}
                    isVisible={isPreviewVisible}
                    onToggle={togglePreview}
                  />
                </div>
              )}
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
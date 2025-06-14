import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

// Component for rendering a directory in the file tree
const Directory = ({ directory, currentFile, onFileSelect, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // If this directory has no children, render nothing
  if (!directory.children || directory.children.length === 0) {
    return null;
  }
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const paddingLeft = `${level * 10}px`;
  
  return (
    <div className="mb-1">
      <div 
        className="flex items-center text-gray-300 hover:text-white py-1 cursor-pointer"
        style={{ paddingLeft }}
        onClick={toggleExpand}
      >
        <span className="w-4 inline-block">
          {isExpanded ? '▼' : '►'}
        </span>
        <span className="ml-1">📁</span>
        <span className="ml-1 truncate">{directory.name}</span>
      </div>
      
      {isExpanded && (
        <div>
          {directory.children.map(item => (
            item.type === 'directory' ? (
              <Directory
                key={item.path}
                directory={item}
                currentFile={currentFile}
                onFileSelect={onFileSelect}
                level={level + 1}
              />
            ) : (
              <FileItem
                key={item.path}
                file={item}
                isSelected={currentFile && currentFile.path === item.path}
                onSelect={() => onFileSelect(item)}
                level={level + 1}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

// Component for rendering a file in the file tree
const FileItem = ({ file, isSelected, onSelect, level = 0 }) => {
  const paddingLeft = `${level * 10}px`;
  
  // Get file icon based on extension and file name
  const getFileIcon = (path) => {
    const ext = path.split('.').pop().toLowerCase();
    const fileName = path.toLowerCase();

    // Special icons for specific file types
    if (fileName.includes('word') && ext === 'html') {
      return '📄'; // Word document icon
    }
    if (fileName.includes('presentation') && ext === 'html') {
      return '🎯'; // Presentation icon
    }

    const icons = {
      js: '📄',
      jsx: '⚛️',
      ts: '📄',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      json: '🔧',
      md: '📝',
      txt: '📄',
      default: '📄'
    };

    return icons[ext] || icons.default;
  };
  
  return (
    <div
      className={`flex items-center py-1 cursor-pointer text-sm ${
        isSelected ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:text-white'
      }`}
      style={{ paddingLeft }}
      onClick={onSelect}
    >
      <span className="mr-1">{getFileIcon(file.path)}</span>
      <span className="truncate">{file.name}</span>
    </div>
  );
};

// Main FileExplorer component
const FileExplorer = ({ files, currentFile, onFileSelect }) => {
  const { currentProject } = useProject();
  
  // Organize files into a hierarchical structure
  const organizeFiles = (files) => {
    // Create a root directory
    const root = {
      type: 'directory',
      name: currentProject ? currentProject.projectId : 'Project',
      path: '/',
      children: []
    };
    
    // Add files to the root
    files.forEach(file => {
      if (file.type === 'directory') {
        root.children.push(file);
      } else {
        root.children.push(file);
      }
    });
    
    return root;
  };
  
  const fileTree = organizeFiles(files);
  
  return (
    <div className="h-full p-2 overflow-auto">
      <div className="text-white font-medium py-2 px-2 mb-2 border-b border-gray-700">
        File Explorer
      </div>
      {files.length === 0 ? (
        <div className="text-gray-400 text-sm p-2">
          No files yet. Agents will create files as they work.
        </div>
      ) : (
        <Directory
          directory={fileTree}
          currentFile={currentFile}
          onFileSelect={onFileSelect}
        />
      )}
    </div>
  );
};

export default FileExplorer;
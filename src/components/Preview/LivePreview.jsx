import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';

const LivePreview = ({ isVisible, onToggle }) => {
  const { currentProject } = useProject();
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('🔧 LivePreview rendered - isVisible:', isVisible, 'onToggle type:', typeof onToggle);

  useEffect(() => {
    if (currentProject && isVisible) {
      // Construct the preview URL for the current project
      const url = `http://localhost:3000/api/projects/${currentProject.projectId}/preview`;
      setPreviewUrl(url);
      setIsLoading(true);
      setError(null);

      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentProject, isVisible]);

  const handleRefresh = () => {
    if (previewUrl) {
      setIsLoading(true);
      setError(null);
      
      // Force iframe reload
      const iframe = document.getElementById('preview-iframe');
      if (iframe) {
        iframe.src = iframe.src;
      }
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load preview. Make sure the project is built and the server is running.');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-300">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-gray-700">Live Preview</div>
          {currentProject && (
            <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {currentProject.projectId}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Refresh Preview"
            disabled={isLoading}
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Open in New Tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔧 LivePreview X button clicked - onToggle function:', typeof onToggle);
              if (onToggle && typeof onToggle === 'function') {
                // Use setTimeout to ensure click event is fully processed
                setTimeout(() => {
                  onToggle();
                }, 0);
              } else {
                console.error('🔧 onToggle is not defined or not a function!', onToggle);
              }
            }}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Close Preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-grow relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <div className="text-sm text-gray-600">Loading preview...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center p-6">
              <div className="text-red-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-sm text-gray-600 mb-4">{error}</div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {previewUrl && !error && (
          <iframe
            id="preview-iframe"
            src={previewUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}

        {!previewUrl && !error && !isLoading && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="text-sm text-gray-500">No preview available</div>
              <div className="text-xs text-gray-400 mt-1">Complete the project to see live preview</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;

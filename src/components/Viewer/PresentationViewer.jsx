import React, { useState, useEffect } from 'react';

const PresentationViewer = ({ content, fileName }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle presentation launch
  const launchPresentation = () => {
    const presentationWindow = window.open('', '_blank', 'width=1200,height=800');
    presentationWindow.document.write(content);
    presentationWindow.document.close();
    presentationWindow.focus();
  };

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'business-presentation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'} flex flex-col`}>
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-semibold">🎯 Business Presentation</span>
          <span className="text-sm opacity-90">{fileName}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          <button
            onClick={launchPresentation}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            title="Launch Full Presentation"
          >
            <span>🚀</span>
            <span>Launch Presentation</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
            title="Download Presentation"
          >
            💾
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
          
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 p-2 rounded-lg transition-all duration-200"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Presentation Preview */}
      <div className="flex-1 bg-gray-100 p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading presentation...</p>
            </div>
          </div>
        )}
        
        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            srcDoc={content}
            className="w-full h-full border-0"
            title="Business Presentation"
            sandbox="allow-same-origin allow-scripts"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>📋 <strong>Instructions:</strong></span>
            <span>Click "Launch Presentation" for full-screen slideshow</span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span>⌨️ Arrow keys to navigate</span>
            <span>🎮 Space bar for next slide</span>
            <span>🔄 Auto-play available</span>
          </div>
        </div>
      </div>

      {/* Features Panel */}
      <div className="bg-blue-50 border-t border-blue-200 p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">🎨</span>
            <span>Professional Design</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">📊</span>
            <span>Interactive Navigation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-600">🎯</span>
            <span>Executive Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">📱</span>
            <span>Mobile Responsive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;

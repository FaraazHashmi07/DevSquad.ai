import React, { useState, useEffect } from 'react';

const WordDocumentViewer = ({ content, fileName }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'business-document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'} flex flex-col`}>
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">📄 Word Document</span>
          <span className="text-xs text-gray-500">{fileName}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Zoom Out"
            >
              🔍-
            </button>
            <span className="text-xs text-gray-600 min-w-[40px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Zoom In"
            >
              🔍+
            </button>
            <button
              onClick={resetZoom}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded text-xs"
              title="Reset Zoom"
            >
              100%
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={handlePrint}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Print Document"
          >
            🖨️
          </button>
          
          <button
            onClick={handleDownload}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title="Download Document"
          >
            💾
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
          
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Document viewer */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div 
          className="mx-auto bg-white shadow-lg"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            minHeight: '11in',
            width: '8.5in',
            maxWidth: '8.5in'
          }}
        >
          <iframe
            srcDoc={content}
            className="w-full h-full border-0"
            style={{ 
              minHeight: '11in',
              height: 'auto'
            }}
            title="Word Document"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-1 text-xs text-gray-600 flex justify-between">
        <span>Word-compatible HTML document</span>
        <span>Ready for viewing and printing</span>
      </div>
    </div>
  );
};

export default WordDocumentViewer;

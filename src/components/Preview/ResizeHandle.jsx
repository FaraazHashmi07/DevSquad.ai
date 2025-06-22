import React, { useState, useEffect, useCallback } from 'react';

const ResizeHandle = ({ onResize, initialWidth = 50 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(initialWidth);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(initialWidth);
    e.preventDefault();
  }, [initialWidth]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const containerWidth = window.innerWidth - 80 - 256; // Subtract sidebar widths
    const deltaX = e.clientX - startX;
    const deltaPercent = (deltaX / containerWidth) * 100;
    const newWidth = Math.max(20, Math.min(80, startWidth + deltaPercent));
    
    onResize(newWidth);
  }, [isDragging, startX, startWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`w-1 bg-gray-300 hover:bg-indigo-500 cursor-col-resize transition-colors duration-200 flex-shrink-0 relative group ${
        isDragging ? 'bg-indigo-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator */}
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-8 bg-indigo-500 rounded-full shadow-sm"></div>
      </div>
      
      {/* Drag area */}
      <div className="absolute inset-y-0 -left-2 -right-2"></div>
    </div>
  );
};

export default ResizeHandle;

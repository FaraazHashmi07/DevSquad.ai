import React, { useEffect, useRef } from 'react';

// ConsoleLog component displays logs of agent actions
const ConsoleLog = ({ logs }) => {
  const consoleEndRef = useRef(null);

  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 font-medium">
        Console
      </div>
      
      <div className="flex-grow overflow-auto bg-gray-900 text-gray-200 p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500">No activity yet</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                <span className="text-gray-400">[{formatTimestamp(log.timestamp)}]</span>{' '}
                <span>{log.message}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleLog;
import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';

// Agent workflow item component
const AgentWorkflowItem = ({ agent, status, isActive, index, totalAgents }) => {
  const getInitial = (name) => name.charAt(0).toUpperCase();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-400/30';
      case 'working': return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-400/30 animate-pulse';
      case 'ready': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-400/30';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'working': return '⚡';
      case 'ready': return '🔄';
      default: return '⏳';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'working': return 'Working...';
      case 'ready': return 'Ready';
      default: return 'Waiting';
    }
  };

  return (
    <div className="relative flex flex-col items-center mb-1 transition-all duration-300">
      {/* Continuous vertical line - positioned behind avatar */}
      {index < totalAgents - 1 && (
        <div className={`absolute top-7 left-1/2 transform -translate-x-1/2 w-0.5 h-6 z-0 transition-colors duration-500 ${
          status === 'completed' ? 'bg-green-400 shadow-sm shadow-green-400/50' : 'bg-gray-600'
        }`}></div>
      )}

      <div
        className={`relative z-20 transition-all duration-300 ${isActive ? 'scale-105' : ''}`}
        title={`${agent.name} (${agent.role}) - ${getStatusText(status)}`}
      >
        {/* Avatar background circle for better line separation */}
        <div className="absolute inset-0 rounded-full bg-gray-800 z-10"></div>

        <div className={`
          relative z-20 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs
          ${getStatusColor(status)}
          ${isActive ? 'ring-2 ring-white shadow-lg' : ''}
          ${status === 'completed' ? 'ring-2 ring-green-400 shadow-green-400/50' : ''}
          transition-all duration-500
        `}>
          {status === 'completed' ? '✓' : getInitial(agent.name)}
        </div>

        {/* Enhanced completion glow effect */}
        {status === 'completed' && (
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse z-15"></div>
        )}

        {/* Working animation */}
        {status === 'working' && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping z-15"></div>
        )}
      </div>

      <div className="text-center mt-0.5 z-20 relative">
        <div className={`text-xs font-medium transition-colors duration-300 leading-none ${
          status === 'completed' ? 'text-green-300 font-bold' :
          isActive ? 'text-white' : 'text-gray-300'
        }`}>
          {agent.name}
        </div>
        <div className={`text-xs leading-none transition-colors duration-300 ${
          status === 'completed' ? 'text-green-400' : 'text-gray-500'
        }`}>
          {agent.role}
        </div>
      </div>
    </div>
  );
};

// TeamBar component displays the workflow progress
const TeamBar = () => {
  const { currentAgent, runAgent, currentProject } = useProject();
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [workflowComplete, setWorkflowComplete] = useState(false);

  const agents = [
    { id: 'emma', name: 'Emma', displayName: 'Emma', role: 'Business' },
    { id: 'bob', name: 'Bob', displayName: 'Bob', role: 'Architect' },
    { id: 'david', name: 'David', displayName: 'David', role: 'Data' },
    { id: 'alex', name: 'Alex', displayName: 'Alex', role: 'Engineer' },
    { id: 'devops', name: 'DevOps', displayName: 'DevOps', role: 'Deploy' }
  ];

  // Fetch workflow status
  useEffect(() => {
    if (currentProject?.projectId) {
      console.log('🔧 TeamBar useEffect - currentProject:', currentProject);
      console.log('🔧 TeamBar useEffect - projectId:', currentProject.projectId);
      fetchWorkflowStatus();
      // Poll for updates every 3 seconds
      const interval = setInterval(fetchWorkflowStatus, 3000);
      return () => clearInterval(interval);
    } else {
      console.log('🔧 TeamBar useEffect - No current project');
    }
  }, [currentProject?.projectId]);

  const fetchWorkflowStatus = async () => {
    try {
      const url = `http://localhost:3000/api/projects/${currentProject.projectId}/workflow`;
      console.log('🔧 Fetching workflow status from URL:', url);
      const response = await fetch(url);
      if (response.ok) {
        const status = await response.json();
        console.log('🔧 Workflow status fetched:', status);
        console.log('🔧 Completed agents array:', status.completedAgents);
        console.log('🔧 Completed agents length:', status.completedAgents?.length);
        console.log('🔧 Current agent:', status.currentAgent);
        console.log('🔧 Workflow complete:', status.workflowComplete);
        setWorkflowStatus(status);
        setWorkflowComplete(status.workflowComplete);
      } else {
        console.error('🔧 Failed to fetch workflow status:', response.status);
      }
    } catch (error) {
      console.error('🔧 Error fetching workflow status:', error);
    }
  };

  // Remove manual workflow starting - now fully automatic

  const getAgentStatus = (agentId) => {
    if (!workflowStatus) {
      console.log('🔧 No workflow status for agent:', agentId);
      return 'pending';
    }

    console.log('🔧 Checking status for agent:', agentId, 'completedAgents:', workflowStatus.completedAgents, 'currentAgent:', workflowStatus.currentAgent);

    if (workflowStatus.completedAgents?.includes(agentId)) {
      console.log('🔧 Agent', agentId, 'is COMPLETED');
      return 'completed';
    } else if (workflowStatus.currentAgent === agentId) {
      console.log('🔧 Agent', agentId, 'is WORKING');
      return 'working';
    } else if (canAgentStart(agentId)) {
      console.log('🔧 Agent', agentId, 'is READY');
      return 'ready';
    } else {
      console.log('🔧 Agent', agentId, 'is PENDING');
      return 'pending';
    }
  };

  const canAgentStart = (agentId) => {
    if (!workflowStatus) return false;

    const agentIndex = agents.findIndex(a => a.id === agentId);
    if (agentIndex === 0) return true; // Emma can always start

    // Check if previous agents are completed
    for (let i = 0; i < agentIndex; i++) {
      if (!workflowStatus.completedAgents?.includes(agents[i].id)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="h-full py-1 flex flex-col items-center">
      {/* Ultra-Compact Header */}
      <div className="text-center mb-2">
        <h3 className="text-xs font-bold text-white">AI Team</h3>

        {workflowComplete ? (
          <div className="text-xs text-green-400 animate-pulse font-bold">
            🎉 Complete!
          </div>
        ) : workflowStatus?.currentAgent ? (
          <div className="text-xs text-blue-400">
            ⚡ {agents.find(a => a.id === workflowStatus.currentAgent)?.displayName || workflowStatus.currentAgent}
          </div>
        ) : (
          <div className="text-xs text-gray-400">
            🚀 Starting...
          </div>
        )}

        {/* Ultra-Compact Progress indicator */}
        <div className="w-full bg-gray-700 rounded-full h-1 mt-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((workflowStatus?.completedAgents?.length || 0) / agents.length) * 100}%`
            }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 leading-none">
          {(() => {
            const completedCount = workflowStatus?.completedAgents?.length || 0;
            console.log('🔧 Progress counter - completed:', completedCount, 'total:', agents.length);
            return `${completedCount}/${agents.length}`;
          })()}
        </div>
      </div>

      {/* Agent Workflow Timeline */}
      <div className="flex-1 w-full">
        {agents.map((agent, index) => (
          <AgentWorkflowItem
            key={agent.id}
            agent={agent}
            status={getAgentStatus(agent.id)}
            isActive={currentAgent === agent.id}
            index={index}
            totalAgents={agents.length}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamBar;
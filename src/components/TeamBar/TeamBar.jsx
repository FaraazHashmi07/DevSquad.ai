import React from 'react';
import { useProject } from '../../context/ProjectContext';

// Agent avatar component
const AgentAvatar = ({ name, role, isActive = false, onClick }) => {
  const getInitial = (name) => name.charAt(0).toUpperCase();
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500'
    ];
    // Simple hash function to consistently map agent names to colors
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div 
      className={`relative mb-4 cursor-pointer ${isActive ? 'scale-110' : ''}`}
      onClick={onClick}
      title={`${name} (${role})`}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
        ${getAvatarColor(name)}
        ${isActive ? 'ring-2 ring-white' : ''}
      `}>
        {getInitial(name)}
      </div>
      {isActive && (
        <span className="absolute -right-1 -bottom-1 w-3 h-3 bg-green-400 rounded-full ring-1 ring-white"></span>
      )}
    </div>
  );
};

// TeamBar component displays the agent avatars and the active agent
const TeamBar = () => {
  const { currentAgent, runAgent, currentProject } = useProject();

  const agents = [
    { id: 'emma', name: 'Emma', role: 'Product Manager' },
    { id: 'bob', name: 'Bob', role: 'Architect' },
    { id: 'alex', name: 'Alex', role: 'Engineer' },
    { id: 'david', name: 'David', role: 'Data Analyst' },
    { id: 'devops', name: 'DevOps', role: 'DevOps Engineer' }
  ];

  const handleAgentClick = (agentId) => {
    if (!currentProject) return;
    runAgent(currentProject.projectId, agentId);
  };

  return (
    <div className="h-full py-4 flex flex-col items-center">
      {agents.map(agent => (
        <AgentAvatar
          key={agent.id}
          name={agent.name}
          role={agent.role}
          isActive={currentAgent === agent.id}
          onClick={() => handleAgentClick(agent.id)}
        />
      ))}
    </div>
  );
};

export default TeamBar;
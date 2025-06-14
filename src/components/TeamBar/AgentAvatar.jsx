import React from 'react';

const AgentAvatar = ({ name, role, active }) => {
  return (
    <div className={`flex flex-col items-center ${active ? 'opacity-100' : 'opacity-50'}`}>
      <div 
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-1
          ${active ? 'bg-blue-600 ring-2 ring-white' : 'bg-gray-700'}`}
      >
        {name.charAt(0)}
      </div>
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-gray-400">{role}</div>
    </div>
  );
};

export default AgentAvatar;
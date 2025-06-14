import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useProject } from '../../context/ProjectContext';

const VersionModal = ({ isOpen, onClose, onCreateVersion }) => {
  const { versions, fetchVersions, restoreVersion, currentProject } = useProject();
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    // Fetch versions when the modal opens
    if (isOpen && currentProject) {
      fetchVersions(currentProject.projectId);
    }
  }, [isOpen, currentProject]);

  const handleRestoreVersion = async () => {
    if (!selectedVersion || !currentProject) return;
    
    // Confirm before restoring
    const confirmRestore = window.confirm(
      `Are you sure you want to restore to version: ${selectedVersion.name}? This will overwrite your current project state.`
    );
    
    if (confirmRestore) {
      const success = await restoreVersion(currentProject.projectId, selectedVersion.id);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Versions">
      <div className="mb-4">
        <Button 
          label="Create New Version" 
          onClick={onCreateVersion} 
          variant="primary"
          fullWidth
        />
      </div>
      
      {versions.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No versions available yet
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {versions.map(version => (
            <div 
              key={version.id}
              className={`p-3 border rounded-md cursor-pointer transition-colors
                ${selectedVersion?.id === version.id 
                  ? 'bg-indigo-100 border-indigo-400' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              onClick={() => setSelectedVersion(version)}
            >
              <div className="font-medium">{version.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(version.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedVersion && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Selected Version: {selectedVersion.name}</h4>
          <Button 
            label="Restore This Version" 
            onClick={handleRestoreVersion} 
            variant="danger"
          />
        </div>
      )}
    </Modal>
  );
};

export default VersionModal;
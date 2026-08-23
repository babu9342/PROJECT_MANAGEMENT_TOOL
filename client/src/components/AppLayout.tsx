import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CreateProjectModal from './CreateProjectModal';
import { useProjectStore } from '../store/projectStore';

const AppLayout: React.FC = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { addProject } = useProjectStore();

  return (
    <div className="flex h-screen bg-dark-950 text-dark-100 overflow-hidden">
      <Sidebar onNewProject={() => setShowCreateProject(true)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>

      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreated={(newProj) => addProject(newProj)}
        />
      )}
    </div>
  );
};

export default AppLayout;

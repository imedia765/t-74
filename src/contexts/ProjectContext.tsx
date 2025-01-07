import React, { createContext, useContext, useState, ReactNode } from 'react';

type Project = {
  id: string;
  name: string;
};

type ProjectContextType = {
  selectedProject: Project;
  setSelectedProject: (project: Project) => void;
  projects: Project[];
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProject, setSelectedProject] = useState<Project>({
    id: 'current',
    name: 'Current Project'
  });

  // Mock projects data - in a real app, this would come from your backend
  const projects = [
    { id: 'current', name: 'Current Project' },
    { id: 'project-1', name: 'E-commerce App' },
    { id: 'project-2', name: 'Blog Platform' },
  ];

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject, projects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
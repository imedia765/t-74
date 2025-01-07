import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, Brain, Home, BarChart, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';

const Header = () => {
  const location = useLocation();
  const { selectedProject, setSelectedProject, projects } = useProject();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-accent/20' : '';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              R2-D2 AI Dev Suite
            </span>
          </Link>
          <Select 
            value={selectedProject.id} 
            onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              if (project) setSelectedProject(project);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/"
            className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 px-3 py-2 rounded-md ${isActive('/')}`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            to="/code-generator"
            className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 px-3 py-2 rounded-md ${isActive('/code-generator')}`}
          >
            <Code className="h-4 w-4" />
            <span>Code Generator</span>
          </Link>
          <Link
            to="/researcher"
            className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 px-3 py-2 rounded-md ${isActive('/researcher')}`}
          >
            <Brain className="h-4 w-4" />
            <span>AI Researcher</span>
          </Link>
          <Link
            to="/analytics"
            className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 px-3 py-2 rounded-md ${isActive('/analytics')}`}
          >
            <BarChart className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
          <Link
            to="/configuration"
            className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 px-3 py-2 rounded-md ${isActive('/configuration')}`}
          >
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
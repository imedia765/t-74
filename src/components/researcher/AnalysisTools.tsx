import React from 'react';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface AnalysisTool {
  name: string;
  progress: number;
  description: string;
}

interface AnalysisToolsProps {
  tools: AnalysisTool[];
}

export const AnalysisTools = ({ tools }: AnalysisToolsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Active Analysis Tools</h2>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{tool.name}</span>
                <span className="text-sm text-muted-foreground">{tool.progress}%</span>
              </div>
              <Progress value={tool.progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
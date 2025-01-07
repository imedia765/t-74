import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LLMConfiguration } from '@/components/configuration/LLMConfiguration';
import { FileSystemConfig } from '@/components/configuration/FileSystemConfig';
import { TerminalConfig } from '@/components/configuration/TerminalConfig';
import { VersionControlConfig } from '@/components/configuration/VersionControlConfig';
import { DatabaseConfig } from '@/components/configuration/DatabaseConfig';

const Configuration = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Configuration
      </h1>
      
      <Tabs defaultValue="llm" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="llm">LLM Providers</TabsTrigger>
          <TabsTrigger value="filesystem">File System</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="vcs">Version Control</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
        
        <TabsContent value="llm">
          <LLMConfiguration />
        </TabsContent>
        
        <TabsContent value="filesystem">
          <FileSystemConfig />
        </TabsContent>
        
        <TabsContent value="terminal">
          <TerminalConfig />
        </TabsContent>
        
        <TabsContent value="vcs">
          <VersionControlConfig />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuration;
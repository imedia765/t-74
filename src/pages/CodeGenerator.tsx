import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { CodeEditor } from '@/components/CodeEditor';
import { Preview } from '@/components/Preview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLLM } from '@/hooks/useLLM';
import { PromptInput } from '@/components/PromptInput';
import { Button } from '@/components/ui/button';

const CodeGenerator = () => {
  const [code, setCode] = useState('// Your generated code will appear here');
  const [prompt, setPrompt] = useState('');
  const { 
    providers, 
    selectedProvider, 
    setSelectedProvider, 
    generateCode, 
    loadProviders, 
    isLoading, 
    error 
  } = useLLM();

  useEffect(() => {
    loadProviders();
  }, []);

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return;
    
    const result = await generateCode(prompt);
    if (result) {
      setCode(result.result);
      setPrompt('');
    }
  };

  return (
    <div className="h-screen flex">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={70} minSize={30}>
              <main className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    AI Code Generator
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select AI Model" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mb-6">
                  <PromptInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={handleGenerateCode}
                    isLoading={isLoading}
                  />
                </div>

                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={50}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Generated Code</h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCode('// Your generated code will appear here')}
                        >
                          Clear
                        </Button>
                      </div>
                      <CodeEditor code={code} onChange={setCode} />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50}>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">Preview</h2>
                      <Preview content={code} />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default CodeGenerator;
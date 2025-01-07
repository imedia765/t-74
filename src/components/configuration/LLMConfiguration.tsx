import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLLM } from '@/hooks/useLLM';
import { LLMProviderSelect } from '@/components/LLMProviderSelect';

export const LLMConfiguration = () => {
  const { providers, selectedProvider, setSelectedProvider, loadProviders, isLoading, error } = useLLM();
  const [apiKey, setApiKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const handleSave = async () => {
    // TODO: Implement save functionality when backend is ready
    console.log('Saving configuration:', { selectedProvider, apiKey, baseUrl });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Provider Configuration</CardTitle>
        <CardDescription>Configure your LLM providers and API settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <LLMProviderSelect
            providers={providers}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
          {providers.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No providers available. Using mock data.</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <Input
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Base URL (Optional)</label>
          <Input
            placeholder="Enter base URL if using custom endpoint"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="w-full"
        >
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
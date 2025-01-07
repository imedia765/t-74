import { useState } from 'react';
import { llmService } from '@/services/api';
import { LLMProvider, CodeGeneration } from '@/types/llm';
import { useToast } from '@/components/ui/use-toast';

// Mock providers for development
const mockProviders: LLMProvider[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'mistral', name: 'Mistral AI' },
];

export const useLLM = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateCode = async (prompt: string): Promise<CodeGeneration | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await llmService.generateCode(prompt);
      toast({
        title: "Code Generated",
        description: "Your code has been generated successfully.",
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First try to fetch from the API
      const availableProviders = await llmService.getProviders();
      setProviders(availableProviders);
      if (availableProviders.length > 0) {
        setSelectedProvider(availableProviders[0].id);
      }
    } catch (error) {
      // If API fails, use mock data
      console.warn('Using mock providers due to API error:', error);
      setProviders(mockProviders);
      setSelectedProvider(mockProviders[0].id);
      
      toast({
        title: "Warning",
        description: "Using mock providers. Backend connection failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateCode,
    loadProviders,
    providers,
    selectedProvider,
    setSelectedProvider,
    isLoading,
    error,
  };
};
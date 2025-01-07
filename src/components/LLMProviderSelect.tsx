import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLMProvider } from '@/types/llm';

interface LLMProviderSelectProps {
  providers: LLMProvider[];
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
}

export const LLMProviderSelect: React.FC<LLMProviderSelectProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
}) => {
  return (
    <Select value={selectedProvider} onValueChange={onProviderChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select LLM Provider" />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            {provider.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
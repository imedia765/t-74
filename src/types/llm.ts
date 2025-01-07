export interface LLMProvider {
  id: string;
  name: string;
  baseUrl?: string;
  apiKey?: string;
}

export interface CodeGeneration {
  prompt: string;
  result: string;
  provider: string;
  timestamp: number;
}

export interface FileOperation {
  path: string;
  content: string;
  timestamp: number;
}
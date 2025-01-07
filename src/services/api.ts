import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Bolt.diy backend URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const llmService = {
  async generateCode(prompt: string) {
    try {
      const response = await api.post('/api/generate', { prompt });
      return response.data;
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  },

  async getProviders() {
    try {
      const response = await api.get('/api/providers');
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }
};

export const fileService = {
  async listFiles() {
    try {
      const response = await api.get('/api/files');
      return response.data;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  },

  async saveFile(path: string, content: string) {
    try {
      const response = await api.post('/api/files', { path, content });
      return response.data;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }
};
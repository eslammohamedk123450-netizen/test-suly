export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'streaming' | 'complete' | 'error';
  tokensCount?: number;
  latencyMs?: number;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  projectId?: string;
}

export interface MemoryItem {
  id: string;
  text: string;
  category: 'preference' | 'persona' | 'technical' | 'custom';
  enabled: boolean;
  createdAt: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  size: number;
  uploadedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  documents: ProjectDocument[];
  createdAt: number;
}

export interface CanvasArtifact {
  id: string;
  title: string;
  language: string;
  type: 'code' | 'markdown' | 'html';
  content: string;
  version: number;
  history: string[];
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTimeMs: number;
  status: 'idle' | 'running' | 'success' | 'error';
}

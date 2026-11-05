export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 or object URL
  size?: number;
  type: 'image' | 'file';
}

export interface CustomGpt {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  category: 'Featured' | 'DALL·E' | 'Writing' | 'Productivity' | 'Coding' | 'Education';
  author: string;
  capabilities: string[];
  systemPrompt: string;
  starterPrompts: string[];
}

export interface MessageMetrics {
  tokenCount: number;
  durationMs: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  thoughts?: string;
  isStreaming?: boolean;
  error?: string;
  modelUsed?: string;
  generatedImageUrl?: string;
  metrics?: MessageMetrics;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: string;
  customGptId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  tag: string;
  icon: 'sparkle' | 'brain' | 'zap' | 'cpu';
  capabilities: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  plan: 'Free' | 'Plus' | 'Pro' | 'Team';
  avatarInitials: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'en' | 'ar';
  customInstructions: {
    aboutUser: string;
    responsePreferences: string;
  };
  voice: 'Breeze' | 'Cove' | 'Ember' | 'Juniper' | 'Sky';
  soundEnabled: boolean;
  streamResponse: boolean;
  zenMode?: boolean;
}

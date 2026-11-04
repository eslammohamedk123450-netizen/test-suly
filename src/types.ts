export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 or object URL
  size?: number;
  type: 'image' | 'file';
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
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: string;
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
}

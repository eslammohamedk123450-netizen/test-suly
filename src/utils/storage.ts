import { Conversation, AppSettings, UserProfile, Folder, MemoryItem } from '../types';

const CONVERSATIONS_KEY = 'chatgpt_conversations_v1';
const CURRENT_ID_KEY = 'chatgpt_current_conv_id';
const SETTINGS_KEY = 'chatgpt_settings_v1';
const PROFILE_KEY = 'chatgpt_profile_v1';
const FOLDERS_KEY = 'chatgpt_folders_v1';

export const initialFolders: Folder[] = [];
export const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'ar',
  customInstructions: {
    aboutUser: '',
    responsePreferences: '',
  },
  voice: 'Juniper',
  soundEnabled: true,
  streamResponse: true,
  memoryEnabled: true,
  memories: [],
};

export const defaultProfile: UserProfile = {
  name: 'SULY User',
  email: '',
  plan: 'Free',
  avatarInitials: 'SU',
};

// Start with a clean history; do not seed fabricated conversations for new users.
export const initialConversations: Conversation[] = [];
export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) {
      saveConversations(initialConversations);
      return initialConversations;
    }
    return JSON.parse(raw);
  } catch {
    return initialConversations;
  }
}

export function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch (e) {
    console.error('Failed to save conversations to localStorage', e);
  }
}

export function loadCurrentConvId(): string | null {
  try {
    return localStorage.getItem(CURRENT_ID_KEY);
  } catch {
    return null;
  }
}

export function saveCurrentConvId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(CURRENT_ID_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_ID_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) {
      saveFolders(initialFolders);
      return initialFolders;
    }
    return JSON.parse(raw);
  } catch {
    return initialFolders;
  }
}

export function saveFolders(folders: Folder[]) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error(e);
  }
}

// Group conversations into SULY standard date groups
export interface GroupedConversations {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  previous7Days: Conversation[];
  previous30Days: Conversation[];
  older: Conversation[];
}

export function groupConversations(convs: Conversation[]): GroupedConversations {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7Days = startOfToday - 86400000 * 7;
  const startOf30Days = startOfToday - 86400000 * 30;

  const grouped: GroupedConversations = {
    pinned: [],
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  };

  convs
    .filter((c) => !c.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((conv) => {
      if (conv.isPinned) {
        grouped.pinned.push(conv);
        return;
      }
      if (conv.updatedAt >= startOfToday) {
        grouped.today.push(conv);
      } else if (conv.updatedAt >= startOfYesterday) {
        grouped.yesterday.push(conv);
      } else if (conv.updatedAt >= startOf7Days) {
        grouped.previous7Days.push(conv);
      } else if (conv.updatedAt >= startOf30Days) {
        grouped.previous30Days.push(conv);
      } else {
        grouped.older.push(conv);
      }
    });

  return grouped;
}

// Read text aloud using Web Speech API
export function speakText(text: string, voiceName?: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  // Strip markdown tags for clean audio speech
  const clean = text
    .replace(/```[\s\S]*?```/g, ' [كود برمجي تم تخطيه] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*_~>|]/g, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(clean);
  const voices = window.speechSynthesis.getVoices();

  if (voiceName) {
    const match = voices.find((v) => v.name.toLowerCase().includes(voiceName.toLowerCase()));
    if (match) utterance.voice = match;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

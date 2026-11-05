import { Conversation, MemoryItem, Project } from '../types';

const CONVERSATIONS_KEY = 'suly_conversations_v1';
const MEMORIES_KEY = 'suly_memories_v1';
const PROJECTS_KEY = 'suly_projects_v1';
const ACTIVE_CONV_KEY = 'suly_active_conv_id';

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    text: 'تفضيل الأسلوب البليغ والمباشر بدون اعتذارات أو حشو إنشائي',
    category: 'persona',
    enabled: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'mem-2',
    text: 'كتابة أكواد نظيفة بالمعايير الحديثة مع شرح مقتضب وشديد الدقة',
    category: 'technical',
    enabled: true,
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'mem-3',
    text: 'تفضيل استخدام تقنيات React وTypeScript وPython وTailwind',
    category: 'preference',
    enabled: true,
    createdAt: Date.now() - 2000000,
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-general',
    name: 'المشروع العام (Default Workspace)',
    description: 'مساحة العمل الافتراضية للأسئلة والتطوير السريع ومراجعة المستندات',
    documents: [],
    createdAt: Date.now(),
  },
];

export function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch (err) {
    console.error('Failed to save conversations:', err);
  }
}

export function loadActiveConvId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CONV_KEY);
  } catch {
    return null;
  }
}

export function saveActiveConvId(id: string) {
  try {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } catch {}
}

export function loadMemories(): MemoryItem[] {
  try {
    const data = localStorage.getItem(MEMORIES_KEY);
    if (!data) {
      saveMemories(DEFAULT_MEMORIES);
      return DEFAULT_MEMORIES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_MEMORIES;
  }
}

export function saveMemories(memories: MemoryItem[]) {
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error('Failed to save memories:', err);
  }
}

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    if (!data) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects:', err);
  }
}

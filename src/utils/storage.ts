import { Conversation, AppSettings, UserProfile } from '../types';

const CONVERSATIONS_KEY = 'chatgpt_conversations_v1';
const CURRENT_ID_KEY = 'chatgpt_current_conv_id';
const SETTINGS_KEY = 'chatgpt_settings_v1';
const PROFILE_KEY = 'chatgpt_profile_v1';

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
};

export const defaultProfile: UserProfile = {
  name: 'Eslam Mohamed',
  email: 'eslammohamedk123450@gmail.com',
  plan: 'Plus',
  avatarInitials: 'EM',
};

// Initial welcome conversation so the user sees real chat history immediately
export const initialConversations: Conversation[] = [
  {
    id: 'conv-sample-1',
    title: 'مرحبا بك في ChatGPT',
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    updatedAt: Date.now() - 1000 * 60 * 30,
    model: 'gpt-4o',
    isPinned: true,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'مرحبًا! ما هي مميزات ChatGPT الجديدة؟',
        createdAt: Date.now() - 1000 * 60 * 30,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `أهلاً بك! **ChatGPT** تم تصميمه ليوفر تجربة محادثة فائقة السرعة والدقة. إليك أبرز الميزات المتاحة لك الآن:

### 🌟 المميزات الرئيسية:
- **تبديل النماذج الذكي**: اختيار بين **GPT-4o** (النموذج الرائد الشامل)، و**o1** (نموذج التفكير العميق وحل المشكلات الهندسية والبرمجية المعقدة)، و**GPT-4o mini** (السرعة الفائقة للمهام اليومية).
- **وضع البحث في الويب (Search)**: تفعيل زر الكرة الأرضية 🌐 للبحث الفوري عن أحدث البيانات والروابط.
- **وضع التفكير المتقدم (Reasoning)**: تفعيل زر المصباح 💡 لرؤية خطوات التفكير المنطقي خطوة بخطوة.
- **إرفاق الملفات والصور**: دعم فحص الصور والمستندات وتحليلها مباشرة.
- **المحادثة الصوتية (Voice Mode)**: محادثة تفاعلية مباشرة مع مؤثرات بصرية حية واختيار أصوات طبيعية.
- **إدارة المحادثات الكاملة**: تثبيت، إعادة تسمية، أرشفة، حذف، ومشاركة الروابط.
- **التصميم المظلم والفاتح**: دعم كامل لمظهر ChatGPT الداكن الأيقوني والوضع الفاتح ودعم العربية RTL والإنجليزية LTR.

ما الذي تحب أن نبدأ به اليوم؟`,
        createdAt: Date.now() - 1000 * 60 * 29,
        modelUsed: 'gpt-4o',
      },
    ],
  },
  {
    id: 'conv-sample-2',
    title: 'كود Python لتحليل البيانات',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // Yesterday
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    model: 'gpt-4o',
    messages: [
      {
        id: 'msg-21',
        role: 'user',
        content: 'اكتب لي مثال كود بايثون سريع لقراءة ملف CSV وحساب المتوسطات.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        id: 'msg-22',
        role: 'assistant',
        content: `إليك كود بايثون بسيط وأنيق باستخدام مكتبة **pandas**:

\`\`\`python
import pandas as pd

# تحميل ملف البيانات
df = pd.read_csv('sales_data.csv')

# عرض أول 5 أسطر
print("--- نظرة عامة على البيانات ---")
print(df.head())

# حساب المتوسطات للأعمدة الرقمية
numeric_summary = df.describe().T[['mean', 'std', 'min', 'max']]
print("\n--- الإحصائيات والمتوسطات ---")
print(numeric_summary)
\`\`\`

يمكنك تنفيذ هذا الكود مباشرة، أو إذا كان لديك ملف حقيقي يمكنك رفعه هنا وسأقوم بتحليله لك فوراً!`,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 + 1000,
        modelUsed: 'gpt-4o',
      },
    ],
  },
  {
    id: 'conv-sample-3',
    title: 'خطة وجبات صحية ورياضية',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    model: 'o1',
    messages: [
      {
        id: 'msg-31',
        role: 'user',
        content: 'اقترح لي نظام غذائي بسيط عالي البروتين.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      },
      {
        id: 'msg-32',
        role: 'assistant',
        content: `إليك جدول يومي متوازن عالي البروتين:

| الوجبة | المكونات | كمية البروتين المقدرة |
| :--- | :--- | :--- |
| **الإفطار** | 3 بيضات مسلوقة + شوفان مع حليب ولوز | ~30 جرام |
| **سناك خفيف** | علبة زبادي يوناني + ثمرة تفاح | ~15 جرام |
| **الغداء** | 200 جم صدور دجاج مشوية + أرز بني + سلطة خضراء | ~45 جرام |
| **سناك قبل التمرين**| موزة مع ملعقة زبدة فول سوداني | ~8 جرام |
| **العشاء** | علبة تونة مصفاة أو سلمون مشوي + بطاطا حلوة | ~35 جرام |

إجمالي البروتين اليومي يصل لحوالي **130-140 جرام** وهو ممتاز لبناء العضلات والاستشفاء الرياضي.`,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 + 2000,
        modelUsed: 'o1',
      },
    ],
  },
];

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

// Group conversations into ChatGPT standard date groups
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

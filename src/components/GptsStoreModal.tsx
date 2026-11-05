import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Code,
  Image,
  BookOpen,
  BarChart3,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ArrowRight,
  Check,
} from 'lucide-react';
import { CustomGpt } from '../types';

export const CURATED_GPTS: CustomGpt[] = [
  {
    id: 'gpt-dalle',
    name: 'DALL·E',
    tagline: 'حول أفكارك وتخيلاتك إلى صور فوتوغرافية وأعمال فنية مبهرة.',
    description: 'متخصص في توليد وتعديل الصور بجودة فائقة مع اقتراح تحسينات بصرية إبداعية.',
    avatar: '🎨',
    category: 'DALL·E',
    author: 'OpenAI',
    capabilities: ['توليد صور فوتوغرافية', 'رسومات رقمية', 'تعديل الإضاءة والزوايا'],
    systemPrompt: 'أنت مساعد DALL·E المتخصص في تحويل الأفكار إلى صور وأعمال فنية. صف كل مشهد بتفاصيل سينمائية مبهرة باللغة التي يطلبها المستخدم واقترح أنماطاً بصرية إبداعية.',
    starterPrompts: [
      'ارسم لوحة زيتية كلاسيكية لرائد فضاء يشرب القهوة في باريس.',
      'صورة فوتوغرافية لسيارة كهربائية مستقبلية في شوارع طوكيو الممطرة.',
      'شعار Minimalist حديث لشركة ذكاء اصطناعي ناشئة.',
    ],
  },
  {
    id: 'gpt-coding',
    name: 'Code Copilot Pro',
    tagline: 'شريكك البرمجي لكتابة، تصحيح، وهندسة الأكواد بأعلى معايير Clean Code.',
    description: 'يساعد في بناء تطبيقات الويب والهواتف، تصحيح الأخطاء المعقدة، وتحسين أداء الخوارزميات.',
    avatar: '💻',
    category: 'Coding',
    author: 'ChatGPT Community',
    capabilities: ['فحص الأمان والثغرات', 'إعادة هيكلة Refactoring', 'كتابة اختبارات Unit Tests'],
    systemPrompt: 'أنت مهندس برمجيات محترف (Staff Software Engineer). قدم أكواداً كاملة وعالية الجودة متوافقة مع أحدث المعايير مع شرح مقتضب وشامل، واقترح أفضل الممارسات الأمنية وهندسة البرمجيات.',
    starterPrompts: [
      'اكتب لي Hook مخصص في React لإدارة الاتصال مع Server-Sent Events.',
      'افحص هذا الكود وحدد سبب تسرب الذاكرة أو بطء الاستجابة.',
      'صمم بنية قاعدة بيانات متكاملة لمنصة تجارة إلكترونية.',
    ],
  },
  {
    id: 'gpt-data',
    name: 'Data Analyst & Insights',
    tagline: 'تحليل جداول البيانات، استخراج المؤشرات، وتوليد الرسوم البيانية.',
    description: 'ارفع ملفات CSV أو JSON أو ألصق الأرقام لتحصل على تقارير إحصائية وتوقعات دقيقة.',
    avatar: '📊',
    category: 'Productivity',
    author: 'ChatGPT Community',
    capabilities: ['تحليل إحصائي متقدم', 'توليد رسوم بيانية', 'اكتشاف الأنماط والاتجاهات'],
    systemPrompt: 'أنت عالم بيانات ومحلل أعمال أول. حلل كل مجموعة بيانات بدقة، وقدم جداول مقارنة ومؤشرات إحصائية (Mean, Median, Trends) مع استنتاجات عملية قابلة للتنفيذ.',
    starterPrompts: [
      'حلل لي بيانات مبيعات ربع سنوية وقارن نسبة النمو.',
      'كيف أنظف وأعالج البيانات المفقودة في جدول عملاء؟',
      'اقترح أهم 5 مؤشرات أداء (KPIs) لمتجر إلكتروني جديد.',
    ],
  },
  {
    id: 'gpt-writer',
    name: 'Creative Writing Mentor',
    tagline: 'صياغة المقالات، القصص، والنصوص التسويقية بنبرة بليغة وجذابة.',
    description: 'شريكك الإبداعي لتحسين أسلوب الكتابة، صياغة رسائل البريد، وبناء محتوى احترافي.',
    avatar: '✍️',
    category: 'Writing',
    author: 'ChatGPT Community',
    capabilities: ['كتابة إبداعية وبلاغية', 'صياغة إعلانات Copywriting', 'تدقيق لغوي وصياغي'],
    systemPrompt: 'أنت كاتب ومحرر نصوص أدبي وصحفي بارع. اكتب بلغة فصيحة، رنانة، وأنيقة تتناسب تماماً مع الجمهور المستهدف والنبرة المطلوبة.',
    starterPrompts: [
      'اكتب مقالاً ملهماً عن مستقبل العمل والذكاء الاصطناعي في 2026.',
      'صيغ بريداً إلكترونياً دبلوماسياً واحترافياً لطلب زيادة الميزانية.',
      'أعد كتابة هذه الفقرة لتكون أكثر تأثيراً وجاذبية.',
    ],
  },
  {
    id: 'gpt-math',
    name: 'Math & STEM Solver',
    tagline: 'حل مسائل التفاضل، الجبر، والفيزياء خطوة بخطوة مع البراهين.',
    description: 'مرشد أكاديمي يشرح النظريات العلمية والمعادلات الصعبة بتبسيط ومنطق واضح.',
    avatar: '🔬',
    category: 'Education',
    author: 'OpenAI Education',
    capabilities: ['حل معادلات تفاضلية', 'براهين رياضية', 'محاكاة فيزيائية'],
    systemPrompt: 'أنت أستاذ في العلوم والرياضيات والفيزياء. اشرح كل مسألة بخطوات تفصيلية مرتبة، مع ذكر القوانين المستخدمة والسبب المنطقي لكل خطوة.',
    starterPrompts: [
      'اشرح لي مفهوم تحويلات فورييه (Fourier Transform) بتطبيق عملي.',
      'حل هذه المعادلة التفاضلية خطوة بخطوة مع بيان شروط الاستقرار.',
      'كيف تعمل خوارزمية التعلم العميق رياضياً في طبقات الانحدار؟',
    ],
  },
];

interface GptsStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGpt: (gpt: CustomGpt, initialPrompt?: string) => void;
  isRtl?: boolean;
}

export const GptsStoreModal: React.FC<GptsStoreModalProps> = ({
  isOpen,
  onClose,
  onSelectGpt,
  isRtl = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Featured', 'DALL·E', 'Coding', 'Writing', 'Productivity', 'Education'];

  const filtered = CURATED_GPTS.filter((gpt) => {
    const matchesSearch =
      gpt.name.toLowerCase().includes(search.toLowerCase()) ||
      gpt.description.toLowerCase().includes(search.toLowerCase()) ||
      gpt.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || gpt.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#0d0d0d] dark:text-[#ececec]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isRtl ? 'استكشف نماذج ومساعدي GPTs' : 'Explore GPTs'}
              </h3>
              <p className="text-xs text-[#8e8e8e]">
                {isRtl
                  ? 'اكتشف نسخاً مخصصة من ChatGPT تجمع بين التعليمات والمهارات المتقدمة'
                  : 'Discover customized versions of ChatGPT tailored for specific tasks'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e8e8e] hover:text-inherit hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/10 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8e8e8e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? 'ابحث في النماذج والمساعدين...' : 'Search GPTs...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-white dark:bg-[#171717] border border-neutral-300 dark:border-white/10 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === cat
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-[#1a1a1a] text-[#5d5d5d] dark:text-[#b4b4b4] border border-neutral-200 dark:border-white/10 hover:border-neutral-400'
                }`}
              >
                {cat === 'All' ? (isRtl ? 'الكل' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* GPTs Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((gpt) => (
            <div
              key={gpt.id}
              className="flex flex-col justify-between p-4 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-emerald-500/50 bg-white dark:bg-[#1a1a1a] hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {gpt.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#0d0d0d] dark:text-[#ececec] truncate">
                        {gpt.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                        {gpt.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#8e8e8e] line-clamp-1 mt-0.5">{gpt.author}</p>
                  </div>
                </div>

                <p className="text-xs text-[#5d5d5d] dark:text-[#b4b4b4] leading-relaxed line-clamp-2 mb-3">
                  {gpt.tagline}
                </p>

                {/* Capabilities pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {gpt.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 text-[#8e8e8e]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Starter Prompt & Start button */}
              <div className="pt-3 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[#8e8e8e] truncate max-w-[200px]">
                  {gpt.starterPrompts[0]}
                </span>
                <button
                  onClick={() => {
                    onSelectGpt(gpt, gpt.starterPrompts[0]);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity shrink-0"
                >
                  <span>{isRtl ? 'بدء محادثة' : 'Chat'}</span>
                  <ArrowRight size={13} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

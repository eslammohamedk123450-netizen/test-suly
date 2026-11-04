import React from 'react';
import {
  Code,
  Image,
  FileText,
  Lightbulb,
  Mail,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  isRtl?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  isRtl = false,
}) => {
  const suggestions = isRtl
    ? [
        {
          icon: <Code size={18} className="text-emerald-500" />,
          title: 'كتابة وتصحيح الأكواد',
          prompt: 'اكتب كود بايثون متقدم لتحليل البيانات وحساب الإحصائيات مع الشرح.',
        },
        {
          icon: <Image size={18} className="text-blue-500" />,
          title: 'إنشاء ووصف الصور',
          prompt: 'صف لي مشهدًا سينمائيًا فوتوغرافيًا لمدينة مستقبلية وقت الغروب بدقة عالية.',
        },
        {
          icon: <FileText size={18} className="text-amber-500" />,
          title: 'تلخيص وصياغة نصوص',
          prompt: 'ساعدني في تلخيص مقال طويل واستخراج النقاط الـ 5 الأهم مع خطة عمل.',
        },
        {
          icon: <Lightbulb size={18} className="text-purple-400" />,
          title: 'عصف ذهني وأفكار مشاريع',
          prompt: 'اقترح لي 5 أفكار مشاريع تقنية ناشئة تعتمد على الذكاء الاصطناعي في 2026.',
        },
      ]
    : [
        {
          icon: <Code size={18} className="text-emerald-500" />,
          title: 'Code & Debug',
          prompt: 'Write an asynchronous Python function to parse JSON data and handle network errors.',
        },
        {
          icon: <Image size={18} className="text-blue-500" />,
          title: 'Creative Prompting',
          prompt: 'Describe a cinematic wide-angle scene of an architect designing an eco-friendly skyscraper.',
        },
        {
          icon: <FileText size={18} className="text-amber-500" />,
          title: 'Summarize & Synthesize',
          prompt: 'Provide a 3-bullet executive summary and action plan for an upcoming product launch.',
        },
        {
          icon: <Lightbulb size={18} className="text-purple-400" />,
          title: 'Brainstorm Concepts',
          prompt: 'Give me 5 unique, high-potential SaaS startup ideas combining AI with local education.',
        },
      ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto text-center" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Central OpenAI Flower Logo */}
      <div className="w-12 h-12 rounded-full border border-neutral-300 dark:border-white/10 bg-white dark:bg-black flex items-center justify-center shadow-md mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-emerald-600 dark:text-emerald-400">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.8956zm16.5995 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4037-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.4074 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219zm1.145-2.0154l3.3005-1.8994 3.3005 1.8994v3.8035l-3.3005 1.9042-3.3005-1.9042z" />
        </svg>
      </div>

      {/* Main Headline */}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0d0d0d] dark:text-[#ececec] mb-8">
        {isRtl ? 'ما الذي يمكنني مساعدتك به اليوم؟' : 'What can I help with today?'}
      </h2>

      {/* Suggestion Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-start">
        {suggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20 hover:shadow-xs transition-all text-start group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-[#2a2a2a] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-0.5">
                {item.title}
              </div>
              <div className="text-[11px] text-[#8e8e8e] line-clamp-2 leading-relaxed">
                {item.prompt}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

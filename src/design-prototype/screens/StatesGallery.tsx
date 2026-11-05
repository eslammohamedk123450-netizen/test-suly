import React, { useState } from 'react';
import {
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  FolderX,
  FileWarning,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { VisualTheme } from '../types';
import { THEME_CONFIGS } from '../themeTokens';

interface StatesGalleryProps {
  theme: VisualTheme;
}

export const StatesGallery: React.FC<StatesGalleryProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  const [activeStateIndex, setActiveStateIndex] = useState(0);

  const states = [
    {
      id: 'loading',
      title: '1. تحميل أو انتظار (Loading & Skeleton)',
      badge: 'جاري المعالجة (محاكاة)',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'هيكل وميضي لطيف (Shimmer) يحاكي شكل الرد النهائي دون إشغال الشاشة بدوائر متحركة مربكة.',
      render: () => (
        <div className="space-y-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>الوكيل يحلل سياق الطلب ويصيغ الرد (محاكاة واجهة)...</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">بيانات تجريبية</span>
          </div>
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-neutral-800 rounded-md w-3/4" />
            <div className="h-4 bg-neutral-800 rounded-md w-full" />
            <div className="h-4 bg-neutral-800 rounded-md w-5/6" />
          </div>
        </div>
      ),
    },
    {
      id: 'step-exec',
      title: '2. تنفيذ الوكيل لخطوة معينة (Tool Step Execution)',
      badge: 'استدعاء أداة (محاكاة)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'شريط تتبع حي يعرض الأداة المستدعاة بلغة عربية واضحة ومفهومة.',
      render: () => (
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 animate-spin text-amber-400" />
              <span>جاري البحث عبر مراجع الاختبار: [استعلام تجريبي]</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">الخطوة 2 من 3</span>
          </div>
          <p className="text-[11px] text-neutral-300">
            عرض تجريبي لكيفية اطلاع المستخدم على تقدم خطوات الأداة دون حشو تقني...
          </p>
        </div>
      ),
    },
    {
      id: 'completion',
      title: '3. اكتمال المهمة بنجاح (Task Completion)',
      badge: 'مكتمل بالعرض',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'ظهور مؤشر الاكتمال مع أزرار الإجراء السريع النموذجية (معاينة، نسخ، تنزيل تمثيلي).',
      render: () => (
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>اكتملت المعالجة النموذجية للمهمة</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">بيانات تجريبية</span>
          </div>
          <p className="text-xs text-neutral-200">
            تم تجهيز الملخص ومراجع الاختبار والمخرج للمعاينة والمراجعة.
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium">
              معاينة المخرج (محاكاة)
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs">
              نسخ النص
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'temp-error',
      title: '4. خطأ مؤقت أو تعذر الاتصال (Disconnect / Fault)',
      badge: 'استعادة تلقائية',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
      description: 'رسالة إنسانية مريحة مع زر إعادة المحاولة دون فقدان النص المكتوب أو السياق.',
      render: () => (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>تعذر الوصول إلى مصدر خارجي مؤقتاً (محاكاة حالة خطأ)</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            حدث بطء في الاستجابة. محادثتك وسياقك محفوظان محلياً بأمان ويمكنك المحاولة مجدداً.
          </p>
          <button className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs flex items-center gap-1.5 border border-neutral-700">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة (محاكاة)</span>
          </button>
        </div>
      ),
    },
    {
      id: 'empty-state',
      title: '5. لا توجد محادثات أو ملفات (Empty State)',
      badge: 'انطلاقة سريعة',
      badgeColor: 'text-neutral-400 bg-neutral-800 border-neutral-700',
      description: 'شاشة نظيفة تقدم للمستخدم أمثلة حية بنقرة واحدة لبدء العمل فوراً.',
      render: () => (
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <FolderX className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">لا توجد ملفات في مشروعك الحالي</h4>
            <p className="text-[11px] text-neutral-400 mt-1">
              اختر ملف عقد، أو جدول بيانات، أو مسودة عمل لبدء طرح الأسئلة عليه. (الحد الأقصى للملف سيُحدد لاحقاً).
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium inline-flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>رفع ملف تجريبي (محاكاة)</span>
          </button>
        </div>
      ),
    },
    {
      id: 'file-warning',
      title: '6. ملف غير مدعوم أو يتجاوز الحجم (File Warning)',
      badge: 'تنبيه استباقي',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'فحص فوري قبل الإرسال لمنع هدر وقت المستخدم وتوضيح الصيغ المدعومة.',
      render: () => (
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-amber-500/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <FileWarning className="w-4 h-4 text-amber-400" />
            <span>صيغة الملف غير مدعومة أو الحجم يتجاوز المقرر</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            يدعم الوكيل ملفات PDF، ومستندات Word (.docx)، وجداول Excel (.xlsx). (الحد الأقصى للملف سيُحدد لاحقاً). يرجى اختيار ملف متوافق.
          </p>
        </div>
      ),
    },
    {
      id: 'clarification',
      title: '7. طلب يحتاج توضيحاً من المستخدم (Agent Clarification)',
      badge: 'استيضاح ذكي',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'طرح خيارات محددة وسريعة بدلاً من إجابة فضفاضة غير ملبية للحاجة.',
      render: () => (
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-purple-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>توضيح مطلوب لإتقان المخرج:</span>
          </div>
          <p className="text-xs text-neutral-200">
            هل ترغب في صياغة مسودة العرض على هيئة ملخص تنفيذي موجز، أم تقرير مفصل يتضمن جداول الأسعار؟
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs border border-neutral-700">
              ملخص تنفيذي موجز
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs border border-neutral-700">
              تقرير مفصل مع الجداول
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'sensitive-approval',
      title: '8. مهمة تحتاج موافقة قبل إجراء حساس (Sensitive Approval)',
      badge: 'أمان وثقة',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'التزام صارم بحدود المرحلة صفر: الوكيل يجهز المخرجات للمراجعة والتنزيل، ولا ينشر محتوى ولا يغيّر حسابات أو أنظمة خارجية.',
      render: () => (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>موافقة مسبقة مطلوبة (محاكاة واجهة):</span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed">
            الوكيل في هذه النسخة لا ينفذ إجراءات خارجية. هل توافق على حفظ هذه المسودة كمرجع معتمد في مساحة مشروعك؟
          </p>
          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs">
              نعم، اعتمد الإجراء (محاكاة)
            </button>
            <button className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs">
              إلغاء
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'balance-limit',
      title: '9. الرصيد أو الخطة غير كافيين (تصور واجهة للتصميم)',
      badge: 'تصور واجهة',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'رسالة مهنية راقية لتوضيح موضع التنبيه وسلوكه، دون اختراع سياسات خصم أو أسعار باقات غير معتمدة.',
      render: () => (
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-700 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>تنبيه خطة الاستخدام والرصيد (تصور واجهة فقط)</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">لم تُعتمد القواعد بعد</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            الخطة غير محددة حالياً — لم تُعتمد قواعد الرصيد أو سياسات الاستهلاك بعد. هذا الحقل يوضح مكان التنبيه وطريقة إرشاد المستخدم باحترام عند وصوله للحد المقرر مستقبلاً.
          </p>
          <div className="flex gap-2">
            <button className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs border border-neutral-700">
              خيارات الباقات (غير محددة بعد)
            </button>
            <button className="px-3.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 text-xs">
              تصفح الأرشيف والمخرجات
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`p-4 lg:p-8 min-h-[calc(100vh-84px)] ${cfg.bgClass} text-neutral-100 max-w-5xl mx-auto space-y-6`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white">
            معجم حالات الواجهة وسلوكها (The 9 Core UI States)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            نماذج تصميمية وسلوكية للحالات التسع الأساسية لمنع أي توقف مفاجئ للمستخدم أثناء أداء المهام.
          </p>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
          بيانات تجريبية · محاكاة واجهات
        </span>
      </div>

      {/* State Switcher Pills */}
      <div className="flex flex-wrap gap-2">
        {states.map((st, i) => (
          <button
            key={st.id}
            onClick={() => setActiveStateIndex(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeStateIndex === i
                ? `${cfg.buttonPrimaryClass}`
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <span>{st.title.split(' ')[0]} {st.title.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Active State Detailed Display Card */}
      <div className={`p-6 rounded-3xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-5 shadow-xl`}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${states[activeStateIndex].badgeColor} font-mono`}>
              {states[activeStateIndex].badge}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white mt-1.5">
              {states[activeStateIndex].title}
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">الحالة {activeStateIndex + 1} من 9</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          {states[activeStateIndex].description}
        </p>

        {/* Live UI Render Box */}
        <div className="pt-2">
          <p className="text-[11px] text-neutral-400 mb-2 font-mono">معاينة حية للمكون التمثيلي:</p>
          {states[activeStateIndex].render()}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Workflow,
  Search,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Pause,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowDown,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { VisualTheme } from '../types';
import { THEME_CONFIGS } from '../themeTokens';

interface FlowsViewerProps {
  theme: VisualTheme;
}

export const FlowsViewer: React.FC<FlowsViewerProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  const [activeFlowCategory, setActiveFlowCategory] = useState<'user' | 'admin'>('user');
  const [selectedFlowId, setSelectedFlowId] = useState('flow-search');

  const userFlows = [
    {
      id: 'flow-onboarding',
      title: 'تدفق فتح التطبيق والتعريف السريع (مقترح)',
      steps: [
        { title: 'الوصول الأول للمنصة', desc: 'ترحيب هادئ ومباشر باسم SULY AI يوضح تخصص المنصة للأعمال المصغرة والمستقلين.' },
        { title: 'عرض المهام الثلاث للمرحلة الأولى', desc: 'بطاقات بدء فورية بنقرة واحدة: [بحث ويب مع مراجع] · [تحليل ملفات] · [توليد مخرج للمعاينة].' },
        { title: 'بدء أول مهمة', desc: 'الانتقال المباشر لحقل الإدخال مع أمثلة جاهزة لتقليل الجهد الذهني للمستخدم.' },
      ],
    },
    {
      id: 'flow-search',
      title: 'تدفق المهمة 1: بحث الويب وعرض المراجع (مقترح)',
      steps: [
        { title: 'كتابة استعلام البحث', desc: 'يدخل المستخدم سؤاله بالعربية حول موضوع أو مؤشرات أو خدمات.' },
        { title: 'تفعيل خطوة البحث (محاكاة)', desc: 'يظهر شريط حالة أنيق يوضح الكلمات المفتاحية وقراءة المراجع.' },
        { title: 'توليد الملخص المركز', desc: 'صياغة إجابة مركزة مع وضع أرقام مراجع [1]، [2] تفاعلية داخل النص.' },
        { title: 'عرض بطاقات المراجع', desc: 'قائمة بالمواقع التجريبية على نطاق .example لتوضيح طريقة التحقق المباشر ومنع الهلوسة.' },
        { title: 'إجراءات لاحقة اختيارية', desc: 'تحويل نتيجة البحث إلى مسودة تقرير أو طرح سؤال متابعة.' },
      ],
    },
    {
      id: 'flow-file',
      title: 'تدفق المهمة 2: رفع وتحليل المستندات مع الإشارة للمواضع (مقترح)',
      steps: [
        { title: 'اختيار ورفع الملف', desc: 'اختيار ملف PDF أو Word أو Excel (الحد الأقصى للملف سيُحدد لاحقاً).' },
        { title: 'فهرسة صفحات المستند', desc: 'الوكيل يقرأ الجداول والفقرات ويعد فهرساً دلالياً للمحتوى.' },
        { title: 'طرح الأسئلة الحوارية', desc: 'يسأل المستخدم عن بند محدد (مثال: شروط الدفع، نسبة الخصم، غرامات التأخير).' },
        { title: 'تسليم الإجابة بالإحالة المكانية', desc: 'تقديم الإجابة مع شارة واضحة: [المصدر: ص 4 - البند 8.2] لإمكانية المراجعة السريعة.' },
      ],
    },
    {
      id: 'flow-artifact',
      title: 'تدفق المهمة 3: إنشاء مخرج عملي والمعاينة والتنزيل (مقترح)',
      steps: [
        { title: 'طلب المخرج', desc: 'يطلب المستخدم مسودة عرض سعر أو جدول تكاليف أو تقرير تنفيذي.' },
        { title: 'فتح لوحة المخرجات المستقلة', desc: 'بدلاً من الشات المزدحم، يفتح التطبيق عارض المستند بنمط ورقة A4 حقيقية.' },
        { title: 'المعاينة المباشرة', desc: 'مراجعة التنسيق، الجداول، والعناوين قبل التحميل.' },
        { title: 'التنزيل بصيغ متعددة', desc: 'أزرار تنزيل بضغطة زر: PDF جاهز للطباعة، Word قابل للتعديل، أو Excel للبيانات.' },
      ],
    },
    {
      id: 'flow-fault',
      title: 'تدفق التعامل مع الانقطاع والأخطاء ونقص المعلومات (مقترح)',
      steps: [
        { title: 'رصد الخلل أو البطء', desc: 'التعرف على بطء استجابة الشبكة أو أداة البحث الخارجي.' },
        { title: 'رسالة إنسانية مريحة', desc: 'إشعار غير مربك يوضح حفظ السياق المحلي وعدم ضياع أي معلومة.' },
        { title: 'إعادة المحاولة بلمسة واحدة', desc: 'زر [إعادة المحاولة] لاستئناف المهمة من نفس النقطة.' },
        { title: 'التعامل مع نقص المعلومات', desc: 'الوكيل يطلب صراحة استكمال المعلومة بدلاً من التخمين.' },
      ],
    },
    {
      id: 'flow-pause',
      title: 'تدفق إيقاف المهمة وإعادة الاستئناف (مقترح)',
      steps: [
        { title: 'زر إيقاف دائم الظهور', desc: 'أثناء توليد التقرير أو البحث الطويل، يتوفر زر [إيقاف المهمة ■].' },
        { title: 'تجميد المعالجة بأمان', desc: 'يتوقف الوكيل فوراً ويحتفظ بما وصل إليه حتى لحظة التوقف.' },
        { title: 'خيار الاستئناف أو التعديل', desc: 'زر [استئناف ⟳] أو تعديل السؤال لمسار آخر.' },
      ],
    },
    {
      id: 'flow-account',
      title: 'تدفق صفحة الحساب وإظهار الرصيد والخطة (مقترح للتصميم)',
      steps: [
        { title: 'فتح صفحة الحساب', desc: 'عرض بيانات المستخدم التجريبي ونوع نشاطه التمثيلي.' },
        { title: 'عرض حقل الرصيد المقترح', desc: 'توضيح موضع عداد الرصيد المتاح والمجمّد مع تنبيه أن القواعد لم تُعتمد بعد.' },
        { title: 'سجل الاستخدام بدون افتراض قواعد تسعير', desc: 'قائمة بالمهام السابقة وأوقاتها فقط لحين اعتماد قواعد الاشتراك.' },
      ],
    },
  ];

  const adminFlows = [
    {
      id: 'admin-login',
      title: 'تدفق تسجيل الدخول الإداري (تصور واجهة)',
      steps: [
        { title: 'بوابة إدارية منفصلة', desc: 'مسار مستقل (/admin) بتصميم رصين وخالٍ من عناصر تطبيق المستخدم.' },
        { title: 'مصادقة المشرف (محاكاة)', desc: 'إدخال بيانات المشرف التجريبية مع محاكاة التحقق وحماية الجلسة.' },
      ],
    },
    {
      id: 'admin-dash',
      title: 'تدفق لوحة المؤشرات العامة (تصور واجهة)',
      steps: [
        { title: 'مؤشرات الأداء اللحظية', desc: 'متابعة أعداد المستخدمين والمهام ونسب الاكتمال (أرقام افتراضية للتصميم).' },
        { title: 'رصد توزيع المهام', desc: 'متابعة نسب استخدام المهام الثلاث لتحسين البنية التحتية.' },
      ],
    },
    {
      id: 'admin-users',
      title: 'تدفق إدارة المستخدمين والاشتراكات (محاكاة)',
      steps: [
        { title: 'قائمة المستخدمين المفلترة', desc: 'فرز وبحث بحسب البريد، نوع النشاط، أو حالة الاشتراك.' },
        { title: 'عرض ملف المستخدم الكامل', desc: 'نافذة تفاصيل تعرض المهام، الرصيد المتاح والمجمّد، وإجراءات التعديل.' },
      ],
    },
    {
      id: 'admin-credits',
      title: 'تدفق إدارة وسجل حركات الرصيد (محاكاة)',
      steps: [
        { title: 'إجراءات الرصيد النموذجية', desc: 'إضافة، خصم، تجميد، وتحرير رصيد المستخدم التجريبي.' },
        { title: 'نموذج السبب والتأكيد', desc: 'طلب إدخال المقدار والسبب وشاشة مراجعة قبل تطبيق المحاكاة المحلية.' },
        { title: 'سجل القيد والتدقيق', desc: 'توثيق الحركة في جدول الحركات برقم قيد فريد واسم المنفذ وتوقيت افتراضي.' },
      ],
    },
    {
      id: 'admin-settings',
      title: 'تدفق إدارة مزودي ونماذج AI (واجهة فقط)',
      steps: [
        { title: 'قائمة المزودين المسجلين', desc: 'عرض المزودين والنماذج التمثيلية وحالة التفعيل.' },
        { title: 'تخصيص النموذج لكل مهمة', desc: 'تحديد نموذج البحث، وتحليل الملفات، وتوليد المخرجات.' },
        { title: 'حماية المفاتيح', desc: 'مفاتيح API تمثيلية ومشفرة للعرض فقط دون طلب أو إرسال أي مفاتيح حقيقية.' },
      ],
    },
    {
      id: 'admin-logs',
      title: 'تدفق سجلات النشاط الإداري والرقابة (سجل اختباري)',
      steps: [
        { title: 'سجل تدقيق تمثيلي', desc: 'توثيق الحركات الإدارية التجريبية مع الوقت وعنوان IP تجريبي.' },
      ],
    },
  ];

  const currentList = activeFlowCategory === 'user' ? userFlows : adminFlows;
  const activeFlow = currentList.find((f) => f.id === selectedFlowId) || currentList[0];

  return (
    <div className={`p-4 lg:p-8 min-h-[calc(100vh-84px)] ${cfg.bgClass} text-neutral-100 max-w-5xl mx-auto space-y-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Workflow className={`w-5 h-5 ${cfg.accentTextClass}`} />
            <span>مستعرض تدفقات الاستخدام المقترحة (مسودة للمراجعة والاعتماد)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            مخطط كامل لكافة مسارات المستخدم ولوحة الإدارة المقترحة — جميع الإجراءات المعروضة للتصميم والمراجعة.
          </p>
        </div>

        {/* Category Switcher */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1">
          <button
            onClick={() => {
              setActiveFlowCategory('user');
              setSelectedFlowId('flow-search');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowCategory === 'user'
                ? `${cfg.accentBgClass} text-white`
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            تدفقات تطبيق المستخدم ({userFlows.length})
          </button>
          <button
            onClick={() => {
              setActiveFlowCategory('admin');
              setSelectedFlowId('admin-dash');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowCategory === 'admin'
                ? `${cfg.accentBgClass} text-white`
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            تدفقات لوحة الإدارة ({adminFlows.length})
          </button>
        </div>
      </div>

      {/* Flows Pills List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
        {currentList.map((flow) => (
          <button
            key={flow.id}
            onClick={() => setSelectedFlowId(flow.id)}
            className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all font-medium ${
              selectedFlowId === flow.id
                ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass} text-white shadow-sm`
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
            }`}
          >
            {flow.title}
          </button>
        ))}
      </div>

      {/* Active Flow Timeline Visualizer */}
      <div className={`p-6 rounded-3xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-6 shadow-xl`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">{activeFlow.title}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              مقترح للمراجعة
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">{activeFlow.steps.length} خطوات متتالية</span>
        </div>

        {/* Visual Stepper Diagram */}
        <div className="space-y-4 relative pr-4">
          {/* Vertical Timeline Guide Line */}
          <div className="absolute right-7 top-4 bottom-4 w-0.5 bg-neutral-800" />

          {activeFlow.steps.map((st, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Step Number Dot */}
              <div className={`w-7 h-7 rounded-full ${idx === 0 ? cfg.accentBgClass : 'bg-neutral-800 border border-neutral-700'} flex items-center justify-center text-xs font-bold text-white shrink-0 z-10 shadow`}>
                {idx + 1}
              </div>

              {/* Step Description Box */}
              <div className={`flex-1 p-3.5 rounded-2xl ${cfg.surfaceElevatedClass} border ${cfg.borderClass} space-y-1 text-right`}>
                <h3 className="text-xs font-bold text-white">{st.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
      title: 'تدفق فتح التطبيق والتعريف السريع',
      steps: [
        { title: 'الوصول الأول للمنصة', desc: 'ترحيب هادئ ومباشر باسم SULY AI يوضح تخصص المنصة للأعمال المصغرة والمستقلين.' },
        { title: 'عرض المهام الثلاث المعتمدة', desc: 'بطاقات بدء فورية بنقرة واحدة: [بحث ويب موثق] · [تحليل ملف PDF/Excel] · [توليد مخرج جاهز].' },
        { title: 'بدء أول مهمة', desc: 'الانتقال المباشر لحقل الإدخال مع أمثلة جاهزة لتقليل الجهد الذهني للمستخدم.' },
      ],
    },
    {
      id: 'flow-search',
      title: 'تدفق المهمة 1: بحث الويب وتوثيق المصادر',
      steps: [
        { title: 'كتابة استعلام البحث', desc: 'يدخل المستخدم سؤاله بالعربية حول موضوع أو سوق أو أسعار.' },
        { title: 'تفعيل أداة البحث الحي', desc: 'يظهر شريط حالة أنيق يوضح الكلمات المفتاحية وأسماء المواقع التي يتم قراءتها.' },
        { title: 'توليد الملخص الذكي', desc: 'صياغة إجابة مركزة مع وضع أرقام مراجع [1]، [2] تفاعلية داخل النص.' },
        { title: 'عرض بطاقات المصادر', desc: 'قائمة بأسماء المواقع والروابط ونسبة موثوقيتها للتحقق المباشر ومنع الهلوسة.' },
        { title: 'إجراءات لاحقة اختيارية', desc: 'تحويل نتيجة البحث إلى مسودة تقرير رسمي أو طرح سؤال متابعة.' },
      ],
    },
    {
      id: 'flow-file',
      title: 'تدفق المهمة 2: رفع وتحليل المستندات مع الإشارة للمواضع',
      steps: [
        { title: 'اختيار ورفع الملف', desc: 'سحب أو اختيار ملف PDF أو Word أو Excel (حتى 25MB) مع فحص الحجم الفوري.' },
        { title: 'فهرسة صفحات المستند', desc: 'الوكيل يقرأ الجداول والفقرات ويعد فهرساً دلالياً للمحتوى.' },
        { title: 'طرح الأسئلة الحوارية', desc: 'يسأل المستخدم عن بند محدد (مثال: شروط الدفع، نسبة الخصم، غرامات التأخير).' },
        { title: 'تسليم الإجابة بالإحالة المكانية', desc: 'تقديم الإجابة مع شارة واضحة: [المصدر: ص 4 - البند 8.2] لإمكانية المراجعة السريعة.' },
      ],
    },
    {
      id: 'flow-artifact',
      title: 'تدفق المهمة 3: إنشاء مخرج عملي والمعاينة والتنزيل',
      steps: [
        { title: 'طلب المخرج', desc: 'يطلب المستخدم مسودة عرض سعر أو جدول تكاليف أو تقرير تنفيذي.' },
        { title: 'فتح لوحة المخرجات المستقلة', desc: 'بدلاً من الشات المزدحم، يفتح التطبيق عارض المستند بنمط ورقة A4 حقيقية.' },
        { title: 'المعاينة المباشرة', desc: 'مراجعة التنسيق، الجداول، والعناوين قبل التحميل.' },
        { title: 'التنزيل بصيغ متعددة', desc: 'أزرار تنزيل بضغطة زر: PDF جاهز للطباعة، Word قابل للتعديل، أو Excel للبيانات.' },
      ],
    },
    {
      id: 'flow-fault',
      title: 'تدفق التعامل مع الانقطاع والأخطاء ونقص المعلومات',
      steps: [
        { title: 'رصد الخلل أو البطء', desc: 'التعرف على بطء استجابة الشبكة أو أداة البحث الخارجي.' },
        { title: 'رسالة إنسانية مريحة', desc: 'إشعار غير مربك يوضح حفظ السياق المحلي وعدم ضياع أي معلومة.' },
        { title: 'إعادة المحاولة بلمسة واحدة', desc: 'زر [إعادة المحاولة] لاستئناف المهمة من نفس النقطة.' },
        { title: 'التعامل مع نقص المعلومات', desc: 'الوكيل يطلب صراحة استكمال المعلومة أو توجيهه للبحث في الويب بدلاً من التخمين.' },
      ],
    },
    {
      id: 'flow-pause',
      title: 'تدفق إيقاف المهمة وإعادة الاستئناف',
      steps: [
        { title: 'زر إيقاف دائم الظهور', desc: 'أثناء توليد التقرير أو البحث الطويل، يتوفر زر [إيقاف المهمة ■].' },
        { title: 'تجميد المعالجة بأمان', desc: 'يتوقف الوكيل فوراً ويحتفظ بما وصل إليه حتى لحظة التوقف.' },
        { title: 'خيار الاستئناف أو التعديل', desc: 'زر [استئناف ⟳] أو تعديل السؤال لمسار آخر.' },
      ],
    },
    {
      id: 'flow-account',
      title: 'تدفق صفحة الحساب وإظهار الرصيد والخطة',
      steps: [
        { title: 'فتح صفحة الحساب', desc: 'عرض بيانات المستخدم ونوع نشاطه (متجر، مستقل، مكتب).' },
        { title: 'عرض رصيد المهام الشفاف', desc: 'عداد بسيط (مثال: 75 / 100 مهمة متبقية) وتاريخ تجديد الحصة الشهرية.' },
        { title: 'سجل الاستخدام بدون افتراض قواعد تسعير', desc: 'قائمة بالمهام السابقة وأوقاتها فقط لحين اعتماد قواعد الاشتراك.' },
      ],
    },
  ];

  const adminFlows = [
    {
      id: 'admin-login',
      title: 'تدفق تسجيل الدخول الإداري الآمن',
      steps: [
        { title: 'بوابة إدارية منفصلة', desc: 'مسار مستقل (/admin) بتصميم رصين وخالٍ من عناصر تطبيق المستخدم.' },
        { title: 'مصادقة المشرف', desc: 'إدخال بيانات المشرف مع محاكاة التحقق الثنائي (2FA) وحماية الجلسة.' },
      ],
    },
    {
      id: 'admin-dash',
      title: 'تدفق لوحة المؤشرات العامة (KPIs)',
      steps: [
        { title: 'مؤشرات الأداء اللحظية', desc: 'متابعة المستخدمين النشطين، حجم المهام اليومي، ونسبة اكتمال العمليات.' },
        { title: 'رصد توزيع المهام', desc: 'متابعة نسب استخدام البحث، وتحليل الملفات، وتصدير المخرجات لتحسين البنية التحتية.' },
      ],
    },
    {
      id: 'admin-users',
      title: 'تدفق إدارة المستخدمين وصفحة التفاصيل',
      steps: [
        { title: 'قائمة المستخدمين المفلترة', desc: 'فرز وبحث بحسب البريد، نوع النشاط، أو الحالة (نشط، تجريبي، معلق).' },
        { title: 'عرض ملف المستخدم الكامل', desc: 'نافذة تفاصيل تعرض إجمالي المهام، الرصيد المتاح، وتاريخ النشاط.' },
      ],
    },
    {
      id: 'admin-credits',
      title: 'تدفق سجل حركات الرصيد (Credits Ledger)',
      steps: [
        { title: 'سجل الحركات الموثق', desc: 'جدول دقيق يسجل كل استهلاك أو إضافة برقم قيد فريد وتوقيت دقيق.' },
        { title: 'تسويات الرصيد الإدارية', desc: 'إمكانية إضافة رصيد تشجيعي أو ترحيبي مع توثيق سبب الحركة في السجل الرقابي.' },
      ],
    },
    {
      id: 'admin-settings',
      title: 'تدفق إعدادات الهوية ونماذج الذكاء الاصطناعي',
      steps: [
        { title: 'اختيار النموذج المعتمد', desc: 'تحديد Gemini 3.8 Flash كنموذج رئيسي للسرعة والدقة العربية.' },
        { title: 'سياسات الرفع والتوثيق', desc: 'تفعيل أو تعطيل البحث الحي وضبط الحد الأقصى لحجم الملفات.' },
      ],
    },
    {
      id: 'admin-logs',
      title: 'تدفق سجلات النشاط الإداري والرقابة (Audit)',
      steps: [
        { title: 'سجل غير قابل للتعديل', desc: 'توثيق كل حركة قام بها أي مشرف مع ذكر الوقت وعنوان الـ IP.' },
      ],
    },
  ];

  const currentList = activeFlowCategory === 'user' ? userFlows : adminFlows;
  const activeFlow = currentList.find((f) => f.id === selectedFlowId) || currentList[0];

  return (
    <div className={`p-4 lg:p-8 min-h-[calc(100vh-52px)] ${cfg.bgClass} text-neutral-100 max-w-5xl mx-auto space-y-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Workflow className={`w-5 h-5 ${cfg.accentTextClass}`} />
            <span>مستعرض تدفقات الاستخدام التفاعلي (Interactive Flowcharts)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            مخطط كامل لكافة مسارات المستخدم ولوحة الإدارة من البداية وحتى تسليم المخرجات والرقابة.
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
          <h2 className="text-base font-bold text-white">{activeFlow.title}</h2>
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

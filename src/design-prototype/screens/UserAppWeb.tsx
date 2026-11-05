import React, { useState } from 'react';
import {
  Search,
  FileText,
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  Plus,
  Compass,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Paperclip,
  Send,
  User,
  CreditCard,
  Settings,
  Clock,
  Layers,
  ChevronLeft,
  X,
  FileDown,
} from 'lucide-react';
import { VisualTheme, TaskType, SourceCitation, GroundedDoc, DeliverableArtifact } from '../types';
import { THEME_CONFIGS } from '../themeTokens';
import { MOCK_SEARCH_SOURCES, MOCK_GROUNDED_DOCS, MOCK_DELIVERABLES } from '../mockData';

interface UserAppWebProps {
  theme: VisualTheme;
}

export const UserAppWeb: React.FC<UserAppWebProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  // Active Task mode
  const [activeTask, setActiveTask] = useState<TaskType>('web-search');
  const [taskState, setTaskState] = useState<'idle' | 'running' | 'completed' | 'paused'>('completed');
  const [executionStep, setExecutionStep] = useState(2);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showArtifactDrawer, setShowArtifactDrawer] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<DeliverableArtifact>(MOCK_DELIVERABLES[0]);
  const [showSensitivePrompt, setShowSensitivePrompt] = useState(false);
  const [promptConfirmed, setPromptConfirmed] = useState(false);
  const [searchSources, setSearchSources] = useState<SourceCitation[]>(MOCK_SEARCH_SOURCES);
  const [activeDoc, setActiveDoc] = useState<GroundedDoc>(MOCK_GROUNDED_DOCS[0]);

  return (
    <div className={`min-h-[calc(100vh-52px)] ${cfg.bgClass} text-neutral-100 flex flex-col md:flex-row transition-colors duration-200`}>
      {/* Desktop Sidebar (Right Side in RTL) */}
      <aside className={`w-full md:w-64 lg:w-72 border-l ${cfg.borderClass} ${cfg.surfaceClass} flex flex-col shrink-0`}>
        {/* Workspace info & New Task */}
        <div className="p-4 border-b border-neutral-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-lg ${cfg.accentBgClass} flex items-center justify-center font-bold text-white text-xs shadow-md`}>
                S
              </span>
              <div>
                <h1 className="text-sm font-bold text-white">SULY AI</h1>
                <p className="text-[11px] text-neutral-400">مساعد الأعمال المصغرة</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTaskState('idle');
                setActiveTask('web-search');
              }}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="مهمة جديدة"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setTaskState('running');
              setTimeout(() => setTaskState('completed'), 1200);
            }}
            className={`w-full py-2 px-3 rounded-xl ${cfg.buttonPrimaryClass} font-medium text-xs flex items-center justify-center gap-2 transition-all`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>بدء مهمة جديدة</span>
          </button>
        </div>

        {/* The 3 Core Agent Tasks Selector */}
        <div className="p-3 border-b border-neutral-800/80">
          <p className="text-[11px] font-semibold text-neutral-400 mb-2 px-1">المهام الثلاث المعتمدة للوكيل:</p>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTask('web-search');
                setTaskState('completed');
              }}
              className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                activeTask === 'web-search'
                  ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass} text-white font-medium`
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Search className={`w-4 h-4 mt-0.5 shrink-0 ${activeTask === 'web-search' ? cfg.accentTextClass : 'text-neutral-500'}`} />
              <div>
                <p className="text-xs font-semibold text-neutral-200">1. بحث الويب وتوثيق المصادر</p>
                <p className="text-[10px] text-neutral-400">جمع نتائج حية مع روابط التحقق المباشرة</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTask('file-analysis');
                setTaskState('completed');
              }}
              className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                activeTask === 'file-analysis'
                  ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass} text-white font-medium`
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${activeTask === 'file-analysis' ? cfg.accentTextClass : 'text-neutral-500'}`} />
              <div>
                <p className="text-xs font-semibold text-neutral-200">2. تحليل الملفات والإحالة للمواضع</p>
                <p className="text-[10px] text-neutral-400">قراءة عقود PDF وجداول Excel بدقة</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTask('deliverable-gen');
                setTaskState('completed');
                setShowArtifactDrawer(true);
              }}
              className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                activeTask === 'deliverable-gen'
                  ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass} text-white font-medium`
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 mt-0.5 shrink-0 ${activeTask === 'deliverable-gen' ? cfg.accentTextClass : 'text-neutral-500'}`} />
              <div>
                <p className="text-xs font-semibold text-neutral-200">3. إنشاء مخرج عملي قابل للتنزيل</p>
                <p className="text-[10px] text-neutral-400">تقارير، مسودات عروض، وجداول جاهزة</p>
              </div>
            </button>
          </div>
        </div>

        {/* Project Files in Knowledge Base */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-neutral-400">ملفات المشروع النشطة</span>
            <span className="text-[10px] text-neutral-400">{MOCK_GROUNDED_DOCS.length} ملفات</span>
          </div>
          <div className="space-y-1.5">
            {MOCK_GROUNDED_DOCS.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  setActiveDoc(doc);
                  setActiveTask('file-analysis');
                }}
                className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  activeDoc.id === doc.id
                    ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass}`
                    : 'border-neutral-800/60 bg-neutral-900/40 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {doc.type === 'pdf' ? (
                    <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="truncate font-medium text-neutral-200">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400 mr-5">
                  <span>{doc.size}</span>
                  <span>·</span>
                  <span>{doc.pagesOrRows}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account and Balance footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/40">
          <button
            onClick={() => setShowAccountModal(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/60 transition-colors text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-300">
                ع.م
              </div>
              <div>
                <p className="text-xs font-semibold text-white">متجر النخبة</p>
                <p className="text-[10px] text-neutral-400">الرصيد: 75 / 100 مهمة</p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </aside>

      {/* Main Agent Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-52px)] overflow-hidden">
        {/* Workspace Top Action Bar */}
        <div className={`h-14 border-b ${cfg.borderClass} px-4 lg:px-6 flex items-center justify-between bg-neutral-950/40 shrink-0`}>
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${taskState === 'running' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <div>
              <h2 className="text-sm font-bold text-white">
                {activeTask === 'web-search' && 'بحث الويب: متوسط أسعار الشحن للمتاجر في السعودية 2026'}
                {activeTask === 'file-analysis' && `تحليل المستند المرفوع: ${activeDoc.name}`}
                {activeTask === 'deliverable-gen' && 'إعداد مخرج عملي: مسودة عرض سعر احترافية'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {taskState === 'running' && 'الوكيل ينفذ المهمة الآن...'}
                {taskState === 'completed' && 'اكتملت المهمة بنجاح وجاهزة للاستخدام'}
                {taskState === 'paused' && 'المهمة موقوفة مؤقتاً بطلب المستخدم'}
              </p>
            </div>
          </div>

          {/* Controls: Pause / Retry / Sensitive Action Simulator */}
          <div className="flex items-center gap-2">
            {taskState === 'running' ? (
              <button
                onClick={() => setTaskState('paused')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium border border-amber-500/20"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف المهمة</span>
              </button>
            ) : taskState === 'paused' ? (
              <button
                onClick={() => setTaskState('running')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-medium border border-emerald-500/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>استئناف</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setTaskState('running');
                  setTimeout(() => setTaskState('completed'), 1000);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs border border-neutral-800"
                title="إعادة المحاولة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إعادة المحاولة</span>
              </button>
            )}

            {/* Artifact Drawer Trigger */}
            <button
              onClick={() => setShowArtifactDrawer(!showArtifactDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showArtifactDrawer
                  ? `${cfg.accentBgClass} text-white`
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>لوحة المخرجات ({MOCK_DELIVERABLES.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Conversation and Steps Feed */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 max-w-4xl mx-auto w-full">
          {/* User Request Bubble */}
          <div className="flex items-start gap-3 justify-end">
            <div className={`max-w-xl p-3.5 rounded-2xl rounded-tr-none ${cfg.surfaceElevatedClass} border ${cfg.borderClass} text-right`}>
              <p className="text-xs font-semibold text-neutral-400 mb-1">أنت (صاحب المتجر):</p>
              <p className="text-sm text-neutral-100 leading-relaxed">
                {activeTask === 'web-search' &&
                  'ابحث لي عن أحدث أسعار الشحن الداخلي للتجارة الإلكترونية في السعودية لعام 2026، ولخص لي الفروقات بين الشركات مع روابط المصادر.'}
                {activeTask === 'file-analysis' &&
                  `استخرج لي من عقد الشحن المرفق (${activeDoc.name}) شروط الدفع، وغرامات التأخير، والحد الأدنى للشحنات مع ذكر رقم الصفحة والبند.`}
                {activeTask === 'deliverable-gen' &&
                  'اكتب لي مسودة عرض خدمات لوجستية وتوزيع رسمية لعميلي (متجر الأناقة)، مع جدول بالأسعار المقترحة وشروط الدفع جاهزة للتنزيل كـ PDF.'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
              أنت
            </div>
          </div>

          {/* Agent Task Progress Step Card */}
          <div className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} shadow-sm`}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md ${cfg.accentBgClass} flex items-center justify-center text-white text-xs`}>
                  <Compass className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-white">خطوات تنفيذ الوكيل الذكي</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-md ${cfg.chipClass} font-mono`}>
                {taskState === 'running' ? 'قيد التنفيذ 2 / 3' : 'مكتمل 3 / 3'}
              </span>
            </div>

            {/* Stepper items */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {activeTask === 'web-search' && 'تحليل استعلام البحث واستخراج المصطلحات الدقيقة'}
                  {activeTask === 'file-analysis' && `فهرسة وقراءة بنية ملف: ${activeDoc.name}`}
                  {activeTask === 'deliverable-gen' && 'صياغة هيكل العرض التجاري وجداول الأسعار'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-neutral-300">
                {taskState === 'running' ? (
                  <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span className="font-medium text-white">
                  {activeTask === 'web-search' && 'فحص وقراءة 3 مصادر ويب رسمية واستخراج الأسعار المعتمدة'}
                  {activeTask === 'file-analysis' && 'استخراج البنود القانونية وتحديد رقم الصفحة والفقرة'}
                  {activeTask === 'deliverable-gen' && 'توليد ملف العرض وحساب الجداول وتنسيق الطباعة'}
                </span>
              </div>
            </div>
          </div>

          {/* Agent Main Result Presentation */}
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full ${cfg.accentBgClass} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md`}>
              S
            </div>
            <div className={`flex-1 p-4 lg:p-5 rounded-2xl rounded-tl-none ${cfg.surfaceClass} border ${cfg.borderClass} space-y-4`}>
              {/* Task 1: Web Search Result & Grounded Sources */}
              {activeTask === 'web-search' && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    ملخص أسعار الشحن الداخلي للمتاجر الإلكترونية في السعودية (2026):
                  </h3>
                  <div className="text-xs text-neutral-300 space-y-2.5 leading-relaxed">
                    <p>
                      بناءً على نتائج البحث ومسوحات القطاع اللوجستي للعام الحالي، تنقسم أسعار الشحن إلى ثلاث فئات رئيسية:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 mr-2 text-neutral-200">
                      <li>
                        <strong>الشركات الناشئة والمرنة:</strong> يتراوح متوسط السعر بين <strong>18 إلى 24 ريالاً</strong> للشحنة (وزن حتى 5 كجم)، مع اشتراط 50 شحنة أسبوعياً كحد أدنى [1].
                      </li>
                      <li>
                        <strong>الشركات اللوجستية الكبرى:</strong> تتراوح الأسعار بين <strong>26 إلى 34 ريالاً</strong>، وتتميز بشبكة فروع أوسع وخاصية التوصيل المسائي في نفس اليوم بالرياض وجدة [2].
                      </li>
                      <li>
                        <strong>رسوم الدفع عند الاستلام (COD):</strong> تستقر عند 5 إلى 8 ريالات للشحنة، مع تفضيل المتاجر للربط مع بوابات الدفع الإلكترونية السريعة لتقليل المرتجعات [3].
                      </li>
                    </ul>
                  </div>

                  {/* Source Grounding Cards List */}
                  <div className="mt-4 pt-3 border-t border-neutral-800">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-neutral-400">المصادر المعتمدة للتحقق:</span>
                      <span className="text-[11px] text-neutral-400">3 روابط موثقة</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {searchSources.map((source) => (
                        <a
                          key={source.id}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2.5 rounded-xl border ${cfg.borderClass} ${cfg.surfaceElevatedClass} hover:border-neutral-600 transition-all block text-right group`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[11px] text-neutral-400 mb-1">
                            <span className="font-mono">[{source.id}] {source.domain}</span>
                            <ExternalLink className="w-3 h-3 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-xs font-medium text-neutral-200 line-clamp-2 leading-snug group-hover:text-blue-300">
                            {source.title}
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] text-neutral-400">
                            {source.reliability}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Task 2: File Analysis with Inline Citations */}
              {activeTask === 'file-analysis' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">
                      استخلاص البنود والشروط من المستند: {activeDoc.name}
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-mono">18 صفحة مفهرسة</span>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    {activeDoc.citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${cfg.borderClass} ${cfg.surfaceElevatedClass} space-y-1`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-semibold ${cfg.accentTextClass}`}>
                            📌 {cite.location}
                          </span>
                          <span className="text-[10px] text-neutral-400">مطابقة دقيقة</span>
                        </div>
                        <p className="text-neutral-200 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/60 font-mono text-[11px]">
                          "{cite.text}"
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-300">
                      هل ترغب في صياغة خطاب تعديل لبند الحد الأدنى للشحنات لتقديمه للشركة؟
                    </span>
                    <button
                      onClick={() => {
                        setActiveTask('deliverable-gen');
                        setShowArtifactDrawer(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg ${cfg.buttonPrimaryClass} text-xs font-medium`}
                    >
                      إنشاء خطاب التعديل
                    </button>
                  </div>
                </div>
              )}

              {/* Task 3: Deliverable Card Quick Launcher */}
              {activeTask === 'deliverable-gen' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">
                      تم إنشاء مخرج العمل: {selectedArtifact.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${cfg.chipClass}`}>
                      جاهز للتنزيل
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    تم إعداد مسودة العرض التجاري المخصص بأسلوب رسمي ومهني، متضمناً نطاق العمل، وجدول الأسعار، وآلية الفوترة، مع الالتزام بالهيكل المعتمد للطباعة والمراجعة.
                  </p>

                  {/* Artifact Preview Card */}
                  <div className={`mt-3 p-3.5 rounded-xl border ${cfg.borderClass} ${cfg.surfaceElevatedClass} flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{selectedArtifact.title}</p>
                        <p className="text-[11px] text-neutral-400">
                          {selectedArtifact.wordCount} كلمة · {selectedArtifact.readTime} · بصيغة PDF و Word
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowArtifactDrawer(true)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
                      >
                        معاينة المستند
                      </button>
                      <button
                        onClick={() => alert('تم بدء تنزيل ملف PDF الخاص بالعرض التجاري.')}
                        className={`px-3 py-1.5 rounded-lg ${cfg.buttonPrimaryClass} text-xs font-medium flex items-center gap-1.5`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sensitive Confirmation Demonstration Prompt */}
              {showSensitivePrompt && !promptConfirmed && (
                <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>موافقة مطلوبة قبل اتخاذ إجراء مؤثر:</span>
                  </div>
                  <p className="leading-relaxed">
                    أنت على وشك اعتماد هذا المخرج وحفظه كمستند رسمي دائم في قاعدة معرفة المشروع واستبدال المسودة القديمة. هل تؤكد المتابعة؟
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setPromptConfirmed(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs"
                    >
                      نعم، اعتمد الإجراء
                    </button>
                    <button
                      onClick={() => setShowSensitivePrompt(false)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {promptConfirmed && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم اعتماد الإجراء وحفظ المستند بعد موافقتك الصريحة.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard?.writeText('تم نسخ ملخص الوكيل.')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => setShowSensitivePrompt(true)}
                    className="hover:text-amber-300 transition-colors"
                  >
                    تجربة طلب موافقة حساسة
                  </button>
                </div>
                <span className="font-mono text-[11px]">زمن الاستجابة: 1.4 ثانية · نموذج Gemini 3.8 Flash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className={`p-3 lg:p-4 border-t ${cfg.borderClass} bg-neutral-950/80 backdrop-blur-sm shrink-0`}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-2 p-2 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} focus-within:border-blue-500/60 transition-all`}>
              <label
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors"
                title="إرفاق ملف PDF أو Excel أو Word"
              >
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      alert(`تم اختيار الملف: ${e.target.files[0].name} (محاكاة رفع ملف وتحليله)`);
                      setActiveTask('file-analysis');
                    }
                  }}
                />
              </label>

              <input
                type="text"
                placeholder="اطلب من SULY AI: ابحث على الويب، حلل ملفاً مرفوعاً، أو استخرج تقريراً..."
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none px-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setTaskState('running');
                    setTimeout(() => setTaskState('completed'), 1000);
                  }
                }}
              />

              <button
                onClick={() => {
                  setTaskState('running');
                  setTimeout(() => setTaskState('completed'), 1000);
                }}
                className={`p-2.5 rounded-xl ${cfg.buttonPrimaryClass} transition-all`}
                title="إرسال الطلب"
              >
                <Send className="w-4 h-4 transform -scale-x-100" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-2 mt-2 px-1 text-[11px] text-neutral-400 overflow-x-auto py-0.5">
              <span className="shrink-0">اقتراحات سريعة:</span>
              <button
                onClick={() => {
                  setActiveTask('web-search');
                  setTaskState('completed');
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors shrink-0"
              >
                🌐 قارن أسعار الشحن 2026
              </button>
              <button
                onClick={() => {
                  setActiveTask('file-analysis');
                  setTaskState('completed');
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors shrink-0"
              >
                📄 ما شروط فسخ العقد المرفق؟
              </button>
              <button
                onClick={() => {
                  setActiveTask('deliverable-gen');
                  setShowArtifactDrawer(true);
                  setTaskState('completed');
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors shrink-0"
              >
                📊 مسودة عرض سعر قابلة للتنزيل
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Deliverable Side Drawer (Split View on Desktop) */}
      {showArtifactDrawer && (
        <aside className={`w-full md:w-96 lg:w-[440px] border-r ${cfg.borderClass} ${cfg.surfaceClass} flex flex-col shrink-0 shadow-2xl z-30 transition-all`}>
          {/* Drawer Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileDown className={`w-4 h-4 ${cfg.accentTextClass}`} />
              <span className="text-sm font-bold text-white">معاينة المخرج وتنزيله</span>
            </div>
            <button
              onClick={() => setShowArtifactDrawer(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Artifact selector */}
          <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/40 flex gap-2">
            {MOCK_DELIVERABLES.map((art) => (
              <button
                key={art.id}
                onClick={() => setSelectedArtifact(art)}
                className={`flex-1 p-2 rounded-lg text-right text-xs transition-colors border ${
                  selectedArtifact.id === art.id
                    ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass} text-white font-semibold`
                    : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800/40'
                }`}
              >
                <p className="truncate">{art.title}</p>
                <p className="text-[10px] text-neutral-400">{art.format.toUpperCase()} · {art.readTime}</p>
              </button>
            ))}
          </div>

          {/* Document Sheet Simulation */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-950/60">
            <div className="bg-white text-neutral-900 p-5 rounded-xl shadow-lg font-sans text-xs space-y-3 leading-relaxed border border-neutral-300">
              <div className="border-b pb-3 border-neutral-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">مخرج رسمي من SULY AI</span>
                <h1 className="text-base font-bold text-neutral-900 mt-1">{selectedArtifact.title}</h1>
                <p className="text-[11px] text-neutral-500 mt-0.5">التاريخ: نوفمبر 2026 · المرجع: SULY-PROP-2026-089</p>
              </div>

              <div className="space-y-2 whitespace-pre-wrap font-sans text-neutral-800 text-xs">
                {selectedArtifact.content}
              </div>

              <div className="border-t pt-3 border-neutral-200 text-[10px] text-neutral-500 flex justify-between">
                <span>تم إعداد المستند عبر SULY AI للأعمال</span>
                <span>الصفحة 1 من 1</span>
              </div>
            </div>
          </div>

          {/* Export Actions pinned at bottom */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/90 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert('تم تنزيل المخرج بصيغة PDF قابلة للطباعة.')}
                className={`py-2 px-3 rounded-xl ${cfg.buttonPrimaryClass} font-medium text-xs flex items-center justify-center gap-1.5`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل PDF (A4)</span>
              </button>
              <button
                onClick={() => alert('تم تنزيل المخرج بصيغة Word (DOCX) للتعديل.')}
                className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-neutral-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل Word (DOCX)</span>
              </button>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(selectedArtifact.content);
                alert('تم نسخ نص المخرج كاملاً إلى الحافظة.');
              }}
              className="w-full py-1.5 text-xs text-neutral-400 hover:text-neutral-200 text-center"
            >
              نسخ النص الخام للمستند
            </button>
          </div>
        </aside>
      )}

      {/* Account and Balance Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${cfg.surfaceClass} border ${cfg.borderClass} rounded-2xl p-5 shadow-2xl text-right space-y-4`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className={`w-4 h-4 ${cfg.accentTextClass}`} />
                <h3 className="text-sm font-bold text-white">تفاصيل الحساب واستخدام الرصيد</h3>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-sm text-neutral-200">
                ع.م
              </div>
              <div>
                <p className="text-xs font-bold text-white">عبدالله بن سعد المطيري</p>
                <p className="text-[11px] text-neutral-400">abdullah.saad@business.sa</p>
                <span className="inline-block mt-0.5 text-[10px] text-emerald-400">عضو نشط · متجر إلكتروني</span>
              </div>
            </div>

            {/* Balance and Plan Cards (No invented deduction rules) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <p className="text-[11px] text-neutral-400">الخطة الحالية</p>
                <p className="text-sm font-bold text-white mt-1">باقة رواد الأعمال</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">تتجدد في 1 ديسمبر 2026</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <p className="text-[11px] text-neutral-400">رصيد المهام المتبقي</p>
                <p className="text-base font-bold text-emerald-400 font-mono tabular-nums mt-0.5">75 / 100</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">تم استهلاك 25 مهمة</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-300 space-y-1.5">
              <p className="font-semibold text-white">سجل استخدام المهام الأخير:</p>
              <div className="space-y-1 text-[11px] text-neutral-400 font-mono">
                <div className="flex justify-between">
                  <span>بحث ويب: أسعار الشحن 2026</span>
                  <span>منذ 10 دقائق</span>
                </div>
                <div className="flex justify-between">
                  <span>تحليل عقد التوريد (18 صفحة)</span>
                  <span>منذ ساعتين</span>
                </div>
                <div className="flex justify-between">
                  <span>إنشاء مسودة عرض سعر</span>
                  <span>أمس</span>
                </div>
              </div>
            </div>

            {/* Note on approval */}
            <p className="text-[10px] text-neutral-400 leading-normal">
              * ملاحظة: أسعار الاشتراكات وبوابات الدفع وآلية خصم الرصيد بانتظار اعتماد صاحب المشروع في المرحلة الأولى.
            </p>

            <button
              onClick={() => setShowAccountModal(false)}
              className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

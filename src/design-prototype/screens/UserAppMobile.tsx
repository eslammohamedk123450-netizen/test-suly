import React, { useState } from 'react';
import {
  MessageSquare,
  CheckSquare,
  FolderClosed,
  User,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  ChevronLeft,
  X,
  Compass,
  Paperclip,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { VisualTheme, TaskType } from '../types';
import { THEME_CONFIGS } from '../themeTokens';
import { MOCK_SEARCH_SOURCES, MOCK_GROUNDED_DOCS, MOCK_DELIVERABLES } from '../mockData';

interface UserAppMobileProps {
  theme: VisualTheme;
}

export const UserAppMobile: React.FC<UserAppMobileProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  // Mobile Active Tab
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'files' | 'account'>('chat');
  const [activeTask, setActiveTask] = useState<TaskType>('web-search');
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [sheetContent, setSheetContent] = useState<'artifact' | 'sources' | 'files'>('sources');

  return (
    <div className={`py-6 px-3 flex flex-col items-center justify-center min-h-[calc(100vh-52px)] ${cfg.bgClass}`}>
      {/* Information Header on Mobile Design */}
      <div className="max-w-md w-full mb-3 text-center">
        <span className="text-[11px] text-neutral-400">
          محاكي تجربة الهاتف الذكي (Mobile-First Touch Ergonomics) · دعم كامل للإبهام والـ RTL
        </span>
      </div>

      {/* Mobile Device Frame */}
      <div className={`w-full max-w-[390px] h-[780px] rounded-[44px] border-[6px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative ${cfg.bgClass} text-neutral-100 font-sans`}>
        {/* Mobile Top Status Notch & App Bar */}
        <div className="bg-neutral-950/80 backdrop-blur-md pt-3 px-6 pb-2 shrink-0 border-b border-neutral-800/80">
          {/* iOS / Android simulated status bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
            <span>9:41</span>
            <div className="w-20 h-4 bg-neutral-900 rounded-full mx-auto" />
            <div className="flex items-center gap-1">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Compact Top App Bar (<54px) */}
          <div className="h-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-md ${cfg.accentBgClass} flex items-center justify-center font-bold text-white text-xs`}>
                S
              </span>
              <span className="text-xs font-bold text-white">SULY AI</span>
            </div>

            {/* Quick Task Switcher Dropdown */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSheetContent('sources');
                  setShowBottomSheet(true);
                }}
                className="px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 flex items-center gap-1"
              >
                <span>المصادر (3)</span>
              </button>
              <button
                onClick={() => {
                  setSheetContent('artifact');
                  setShowBottomSheet(true);
                }}
                className={`px-2 py-1 rounded-lg ${cfg.accentBgClass} text-[10px] font-medium text-white flex items-center gap-1`}
              >
                <span>المخرج 📥</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Content Views */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 pb-20">
          {activeTab === 'chat' && (
            <>
              {/* Task Quick Selector Ribbon */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                  onClick={() => setActiveTask('web-search')}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTask === 'web-search'
                      ? `${cfg.accentBgClass} text-white font-medium`
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>1. بحث الويب والمصادر</span>
                </button>

                <button
                  onClick={() => setActiveTask('file-analysis')}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTask === 'file-analysis'
                      ? `${cfg.accentBgClass} text-white font-medium`
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>2. تحليل الملفات</span>
                </button>

                <button
                  onClick={() => setActiveTask('deliverable-gen')}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTask === 'deliverable-gen'
                      ? `${cfg.accentBgClass} text-white font-medium`
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>3. المخرج والتنزيل</span>
                </button>
              </div>

              {/* User Question */}
              <div className="flex justify-end">
                <div className={`p-3 rounded-2xl rounded-tr-none ${cfg.surfaceElevatedClass} border ${cfg.borderClass} max-w-[85%] text-right text-xs leading-relaxed`}>
                  {activeTask === 'web-search' && 'ابحث عن أسعار الشحن للمتاجر في السعودية 2026 مع روابط المصادر.'}
                  {activeTask === 'file-analysis' && 'ما هي شروط الفسخ والحد الأدنى للشحنات في العقد المرفق؟'}
                  {activeTask === 'deliverable-gen' && 'جهز مسودة عرض السعر لمتجر الأناقة للمراجعة والتنزيل.'}
                </div>
              </div>

              {/* Agent Progress Step Card (Mobile Optimized) */}
              <div className={`p-3 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} text-xs space-y-1.5`}>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم التحقق من المصادر</span>
                  </span>
                  <span className="font-mono text-[10px]">Gemini 3.8 Flash</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  {activeTask === 'web-search' && 'تم جمع البيانات ومقارنة أسعار 3 شركات لوجستية.'}
                  {activeTask === 'file-analysis' && 'تمت مطابقة بند 8.2 وبند 12.1 في الصفحة 4 و7.'}
                  {activeTask === 'deliverable-gen' && 'المسودة جاهزة بتنسيق رسمي ومرفق جدول الأسعار.'}
                </p>
              </div>

              {/* Agent Response Card */}
              <div className={`p-3.5 rounded-2xl rounded-tl-none ${cfg.surfaceClass} border ${cfg.borderClass} text-xs space-y-2.5 text-right leading-relaxed`}>
                {activeTask === 'web-search' && (
                  <>
                    <p className="text-white font-semibold">
                      ملخص أسعار الشحن الداخلي (2026):
                    </p>
                    <p className="text-neutral-300 text-[11px]">
                      - الشركات الناشئة: <strong>18 - 24 ريالاً</strong> للشحنة [1].
                    </p>
                    <p className="text-neutral-300 text-[11px]">
                      - الشركات الكبرى: <strong>26 - 34 ريالاً</strong> مع توصيل بنفس اليوم [2].
                    </p>
                    <p className="text-neutral-300 text-[11px]">
                      - رسوم الدفع عند الاستلام: <strong>5 - 8 ريالات</strong> [3].
                    </p>

                    <button
                      onClick={() => {
                        setSheetContent('sources');
                        setShowBottomSheet(true);
                      }}
                      className={`w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 ${cfg.accentTextClass} font-medium text-[11px] flex items-center justify-center gap-1.5`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>عرض بطاقات المصادر وروابط التحقق (3)</span>
                    </button>
                  </>
                )}

                {activeTask === 'file-analysis' && (
                  <>
                    <p className="text-white font-semibold">
                      شروط العقد المستخلصة:
                    </p>
                    <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-300">
                      <span className={`font-semibold block ${cfg.accentTextClass}`}>📌 ص 4 · بند 8.2:</span>
                      "السداد شهرياً خلال 10 أيام عمل عبر تحويل بنكي."
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-300">
                      <span className={`font-semibold block ${cfg.accentTextClass}`}>📌 ص 7 · بند 12.1:</span>
                      "إنهاء الاتفاقية بإخطار خطي مدته 30 يوماً."
                    </div>
                  </>
                )}

                {activeTask === 'deliverable-gen' && (
                  <>
                    <p className="text-white font-semibold">
                      تم إنشاء المستند: مسودة عرض سعر
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      840 كلمة · 3 دقائق قراءة · متوافق مع معايير الطباعة A4.
                    </p>
                    <button
                      onClick={() => {
                        setSheetContent('artifact');
                        setShowBottomSheet(true);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl ${cfg.buttonPrimaryClass} font-medium text-xs flex items-center justify-center gap-1.5`}
                    >
                      <FileDown className="w-4 h-4" />
                      <span>معاينة وتنزيل المخرج (PDF / Word)</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3 text-right">
              <h3 className="text-xs font-bold text-white">سجل المهام النشطة</h3>
              <div className="space-y-2">
                {[
                  { title: 'بحث ويب: أسعار الشحن 2026', time: 'منذ 10 دقائق', status: 'مكتمل' },
                  { title: 'تحليل عقد التوريد والشحن', time: 'منذ ساعتين', status: 'مكتمل' },
                  { title: 'مسودة عرض الخدمات اللوجستية', time: 'أمس', status: 'جاهز للتنزيل' },
                ].map((t, i) => (
                  <div key={i} className={`p-3 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} flex items-center justify-between`}>
                    <ChevronLeft className="w-4 h-4 text-neutral-500" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-200">{t.title}</p>
                      <p className="text-[10px] text-neutral-400">{t.time} · {t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">ملفات المشروع</h3>
                <button
                  onClick={() => alert('محاكاة اختيار ملف من الهاتف')}
                  className="text-[11px] text-blue-400 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>رفع ملف</span>
                </button>
              </div>

              <div className="space-y-2">
                {MOCK_GROUNDED_DOCS.map((doc) => (
                  <div key={doc.id} className={`p-3 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-1`}>
                    <p className="text-xs font-bold text-neutral-200 truncate">{doc.name}</p>
                    <p className="text-[10px] text-neutral-400">{doc.size} · {doc.pagesOrRows} · {doc.uploadedAt}</p>
                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        setActiveTask('file-analysis');
                      }}
                      className="text-[11px] text-blue-400 pt-1 block"
                    >
                      طرح سؤال على هذا الملف ←
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-3 text-right">
              <h3 className="text-xs font-bold text-white">حسابي والرصيد</h3>
              <div className={`p-3.5 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-2`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-200">
                    ع.م
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">عبدالله بن سعد</p>
                    <p className="text-[10px] text-neutral-400">متجر إلكتروني · باقة رواد الأعمال</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex justify-between items-center">
                  <span className="text-xs text-neutral-300">الرصيد المتبقي:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">75 / 100 مهمة</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Mobile Bottom Sheet (Modal Sheet) */}
        {showBottomSheet && (
          <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
            <div className={`w-full max-h-[80%] rounded-t-3xl ${cfg.surfaceClass} border-t ${cfg.borderClass} p-4 flex flex-col shadow-2xl`}>
              {/* Drag Handle */}
              <div className="w-10 h-1.5 bg-neutral-700 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
                <span className="text-xs font-bold text-white">
                  {sheetContent === 'sources' ? 'المصادر والروابط الموثقة' : 'معاينة المخرج والتنزيل'}
                </span>
                <button
                  onClick={() => setShowBottomSheet(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 text-right text-xs">
                {sheetContent === 'sources' ? (
                  MOCK_SEARCH_SOURCES.map((s) => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>[{s.id}] {s.domain}</span>
                        <span className="text-emerald-400">{s.reliability}</span>
                      </div>
                      <p className="font-semibold text-neutral-200">{s.title}</p>
                      <p className="text-[11px] text-neutral-400">{s.snippet}</p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white text-neutral-900 p-4 rounded-xl text-xs space-y-2 border border-neutral-300">
                      <p className="font-bold text-sm text-neutral-900">{MOCK_DELIVERABLES[0].title}</p>
                      <div className="text-[11px] whitespace-pre-wrap leading-relaxed text-neutral-700">
                        {MOCK_DELIVERABLES[0].content}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => alert('تم تنزيل PDF على الهاتف')}
                        className={`py-2 rounded-xl ${cfg.buttonPrimaryClass} text-xs font-medium flex items-center justify-center gap-1`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل PDF</span>
                      </button>
                      <button
                        onClick={() => alert('تم تنزيل Word على الهاتف')}
                        className="py-2 rounded-xl bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل Word</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fixed Mobile Bottom Chat Input (Sticky Docked) */}
        {activeTab === 'chat' && (
          <div className="absolute bottom-16 left-0 right-0 p-2.5 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/80">
            <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass}`}>
              <button
                onClick={() => alert('محاكاة رفع ملف من الهاتف')}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="اطلب من SULY AI بالعربية..."
                className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none px-1"
              />
              <button
                className={`w-9 h-9 rounded-xl ${cfg.buttonPrimaryClass} flex items-center justify-center shrink-0`}
              >
                <Send className="w-3.5 h-3.5 transform -scale-x-100" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Fixed Bottom Tab Bar (Ergonomic Thumb Zone) */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-800 grid grid-cols-4 items-center px-1 z-30">
          {[
            { id: 'chat', label: 'المحادثة', icon: <MessageSquare className="w-5 h-5" /> },
            { id: 'tasks', label: 'المهام', icon: <CheckSquare className="w-5 h-5" /> },
            { id: 'files', label: 'ملفاتي', icon: <FolderClosed className="w-5 h-5" /> },
            { id: 'account', label: 'حسابي', icon: <User className="w-5 h-5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive ? cfg.accentTextClass : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

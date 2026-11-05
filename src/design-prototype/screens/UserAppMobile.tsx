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
  AlertTriangle,
  Smartphone,
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
  const [mobileNotice, setMobileNotice] = useState<string | null>(null);

  const showMobileNotice = (msg: string) => {
    setMobileNotice(msg);
    setTimeout(() => setMobileNotice(null), 3000);
  };

  return (
    <div className={`py-6 px-3 flex flex-col items-center justify-center min-h-[calc(100vh-84px)] ${cfg.bgClass}`}>
      {/* Information Header on Mobile Design */}
      <div className="max-w-md w-full mb-3 space-y-1.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>محاكاة واجهة هاتف — ليست تطبيقًا منشورًا أو تطبيقًا أصليًا</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          نموذج تجريبي لدراسة بيئة العمل بالأبعاد الرأسية (390px) وتوزيع عناصر التحكم في منطقة الإبهام (Thumb-Zone).
        </p>
      </div>

      {/* Mobile Device Frame */}
      <div className={`w-full max-w-[390px] h-[780px] rounded-[44px] border-[6px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative ${cfg.bgClass} text-neutral-100 font-sans`}>
        {/* Floating Mobile Simulation Toast */}
        {mobileNotice && (
          <div className="absolute top-16 left-3 right-3 z-50 bg-neutral-900/95 border border-amber-500/50 text-amber-200 px-3 py-2 rounded-xl text-[11px] shadow-2xl flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{mobileNotice}</span>
          </div>
        )}

        {/* Mobile Top Status Notch & App Bar */}
        <div className="bg-neutral-950/80 backdrop-blur-md pt-3 px-6 pb-2 shrink-0 border-b border-neutral-800/80">
          {/* Simulated status bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
            <span>9:41</span>
            <div className="w-20 h-4 bg-neutral-900 rounded-full mx-auto" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-amber-400 font-sans">محاكاة</span>
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
              <span className="text-[9px] px-1.5 rounded bg-amber-500/20 text-amber-300">
                تجريبي
              </span>
            </div>

            {/* Quick Task Switcher Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSheetContent('sources');
                  setShowBottomSheet(true);
                }}
                className="px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 flex items-center gap-1"
              >
                <span>المصادر</span>
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
                  <span>1. بحث الويب (تجريبي)</span>
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
                  {activeTask === 'web-search' && 'ابحث عن مؤشرات أسعار الشحن مع مراجع تجريبية للاختبار.'}
                  {activeTask === 'file-analysis' && 'ما هي شروط الفسخ في العقد التجريبي المرفق؟'}
                  {activeTask === 'deliverable-gen' && 'اعرض مسودة تقرير تجريبي جاهزة للمعاينة.'}
                </div>
              </div>

              {/* Agent Progress Step Card (Mobile Optimized) */}
              <div className={`p-3 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} text-xs space-y-1.5`}>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>خطوة محاكاة الوكيل</span>
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono">بيانات تجريبية</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  {activeTask === 'web-search' && 'تم جمع المراجع التجريبية على نطاق .example.'}
                  {activeTask === 'file-analysis' && 'تم استخراج بنود المستند الافتراضي بدقة.'}
                  {activeTask === 'deliverable-gen' && 'المسودة النموذجية جاهزة للمعاينة بالهاتف.'}
                </p>
              </div>

              {/* Agent Response Card */}
              <div className={`p-3.5 rounded-2xl rounded-tl-none ${cfg.surfaceClass} border ${cfg.borderClass} text-xs space-y-2.5 text-right leading-relaxed`}>
                {activeTask === 'web-search' && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">
                        ملخص مؤشرات الشحن (بيانات تجريبية):
                      </p>
                      <span className="text-[9px] px-1.5 rounded bg-amber-500/15 text-amber-300">
                        للتصميم فقط
                      </span>
                    </div>
                    <p className="text-neutral-300 text-[11px]">
                      - فئة أ (تقدير افتراضي): أرقام توضيحية للاختبار [1].
                    </p>
                    <p className="text-neutral-300 text-[11px]">
                      - فئة ب (تقدير افتراضي): أرقام توضيحية للاختبار [2].
                    </p>

                    <button
                      onClick={() => {
                        setSheetContent('sources');
                        setShowBottomSheet(true);
                      }}
                      className={`w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 ${cfg.accentTextClass} font-medium text-[11px] flex items-center justify-center gap-1.5`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>عرض بطاقات المصادر التجريبية (.example)</span>
                    </button>
                  </>
                )}

                {activeTask === 'file-analysis' && (
                  <>
                    <p className="text-white font-semibold">
                      شروط المستند التجريبي:
                    </p>
                    <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-300">
                      <span className={`font-semibold block ${cfg.accentTextClass}`}>📌 ص 4 · بند افتراضي 8.2:</span>
                      "السداد شهرياً خلال 10 أيام عمل عبر تحويل بنكي (نص افتراضي للتصميم)."
                    </div>
                  </>
                )}

                {activeTask === 'deliverable-gen' && (
                  <>
                    <p className="text-white font-semibold">
                      المخرج التجريبي: مسودة عرض خدمات
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      مستند افتراضي للمعاينة والتنسيق على شاشة الجوال.
                    </p>
                    <button
                      onClick={() => {
                        setSheetContent('artifact');
                        setShowBottomSheet(true);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl ${cfg.buttonPrimaryClass} font-medium text-xs flex items-center justify-center gap-1.5`}
                    >
                      <FileDown className="w-4 h-4" />
                      <span>معاينة المخرج (محاكاة تنزيل)</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">سجل المهام (بيانات تجريبية)</h3>
                <span className="text-[9px] text-amber-300">محاكاة واجهة</span>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'بحث ويب: استعلام تجريبي', time: 'عنصر اختبار', status: 'مكتمل بالعرض' },
                  { title: 'تحليل مستند افتراضي', time: 'عنصر اختبار', status: 'مكتمل بالعرض' },
                  { title: 'مسودة تقرير تجريبي', time: 'عنصر اختبار', status: 'جاهز للمعاينة' },
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
                <div>
                  <h3 className="text-xs font-bold text-white">ملفات المشروع (عناصر اختبار)</h3>
                  <p className="text-[10px] text-neutral-400">الحد الأقصى للملف سيُحدد لاحقاً</p>
                </div>
                <button
                  onClick={() => showMobileNotice('محاكاة واجهة: تم النقر على رفع ملف — لا يتم الوصول لملفات الهاتف الفعلية.')}
                  className="text-[11px] text-blue-400 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>رفع ملف (محاكاة)</span>
                </button>
              </div>

              <div className="space-y-2">
                {MOCK_GROUNDED_DOCS.map((doc) => (
                  <div key={doc.id} className={`p-3 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-1`}>
                    <p className="text-xs font-bold text-neutral-200 truncate">{doc.name}</p>
                    <p className="text-[10px] text-neutral-400">{doc.pagesOrRows} · {doc.uploadedAt}</p>
                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        setActiveTask('file-analysis');
                      }}
                      className="text-[11px] text-blue-400 pt-1 block"
                    >
                      طرح سؤال على هذا الملف (محاكاة) ←
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">حسابي والرصيد (واجهة تجريبية)</h3>
                <span className="text-[9px] text-amber-300">للتصميم فقط</span>
              </div>
              <div className={`p-3.5 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-2`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-200">
                    تجريبي
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">مستخدم تجريبي 01</p>
                    <p className="text-[10px] text-neutral-400">الخطة غير محددة · موعد التجديد غير محدد</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
                  <span className="text-xs text-neutral-300 block">رصيد العمليات:</span>
                  <span className="text-xs font-bold text-amber-300">لم تُعتمد قواعد الرصيد بعد</span>
                  <p className="text-[10px] text-neutral-500">حقل افتراضي لتوضيح تخطيط شاشة الهاتف فقط</p>
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
                  {sheetContent === 'sources' ? 'المصادر التجريبية (.example)' : 'معاينة المخرج (محاكاة تنزيل)'}
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
                  <>
                    <p className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      تنبيه: جميع الروابط المعروضة أدناه مراجع اختبارية على نطاق .example غير قابلة للفتح كروابط فعلية ولا تثبت أي معلومة.
                    </p>
                    {MOCK_SEARCH_SOURCES.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => showMobileNotice('رابط تجريبي للاختبار — لا يثبت أي معلومة.')}
                        className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                          <span>[{s.id}] {s.domain}</span>
                          <span className="text-amber-400">{s.reliabilityLabel}</span>
                        </div>
                        <p className="font-semibold text-neutral-200">{s.title}</p>
                        <p className="text-[11px] text-neutral-400">{s.snippet}</p>
                      </div>
                    ))}
                  </>
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
                        onClick={() => showMobileNotice('محاكاة واجهة: تم النقر على تنزيل PDF — لم يتم تنزيل ملف فعلي.')}
                        className={`py-2 rounded-xl ${cfg.buttonPrimaryClass} text-xs font-medium flex items-center justify-center gap-1`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل PDF (محاكاة)</span>
                      </button>
                      <button
                        onClick={() => showMobileNotice('محاكاة واجهة: تم النقر على تنزيل Word — لم يتم تنزيل ملف فعلي.')}
                        className="py-2 rounded-xl bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل Word (محاكاة)</span>
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
                onClick={() => showMobileNotice('محاكاة واجهة: تم النقر على زر المرفق — لا يتم الوصول لملفات الهاتف.')}
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
                onClick={() => showMobileNotice('محاكاة واجهة: تشغيل معالجة الطلب التجريبي.')}
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

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Sliders,
  FileCode,
  Activity,
  Search,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Cpu,
  RefreshCw,
  Lock,
  Layers,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { VisualTheme, AdminUser, CreditTransaction } from '../types';
import { THEME_CONFIGS } from '../themeTokens';
import {
  MOCK_ADMIN_USERS,
  MOCK_CREDIT_TRANSACTIONS,
  MOCK_ADMIN_AUDIT_LOGS,
} from '../mockData';

interface AdminPanelProps {
  theme: VisualTheme;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'users' | 'credits' | 'subscriptions' | 'ai-settings' | 'audit-logs'
  >('dashboard');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(MOCK_ADMIN_USERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Form states for AI Settings
  const [defaultModel, setDefaultModel] = useState('gemini-3.8-flash');
  const [searchGroundingEnabled, setSearchGroundingEnabled] = useState(true);
  const [maxUploadLimitMB, setMaxUploadLimitMB] = useState(25);

  return (
    <div className={`min-h-[calc(100vh-52px)] ${cfg.bgClass} text-neutral-100 flex flex-col md:flex-row transition-colors duration-200`}>
      {/* Admin Dedicated Sidebar */}
      <aside className={`w-full md:w-64 border-l ${cfg.borderClass} ${cfg.surfaceClass} flex flex-col shrink-0`}>
        {/* Admin Brand */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>إدارة SULY AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  لوحة المشرف
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">نطاق الإشراف والتحكم المستقل</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="p-3 space-y-1 text-xs">
          {[
            { id: 'dashboard', label: 'لوحة المؤشرات العامة', icon: <Activity className="w-4 h-4" /> },
            { id: 'users', label: 'المستخدمون وتفاصيلهم', icon: <Users className="w-4 h-4" /> },
            { id: 'credits', label: 'سجل حركات الرصيد', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'subscriptions', label: 'خطط الاشتراكات', icon: <Layers className="w-4 h-4" /> },
            { id: 'ai-settings', label: 'إعدادات النماذج والهوية', icon: <Sliders className="w-4 h-4" /> },
            { id: 'audit-logs', label: 'سجلات النشاط الإداري', icon: <FileCode className="w-4 h-4" /> },
          ].map((item) => {
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-right transition-colors font-medium ${
                  isActive
                    ? `${cfg.surfaceElevatedClass} ${cfg.accentBorderClass} border text-white shadow-sm`
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <span className={isActive ? cfg.accentTextClass : 'text-neutral-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Profile Box */}
        <div className="mt-auto p-3.5 border-t border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-mono text-neutral-300">
              ADM
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white">المشرف الرئيسي</p>
              <p className="text-[10px] text-neutral-400 truncate">admin@suly.ai</p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3" />
            <span>جلسة إدارية مشفرة ومؤمنة</span>
          </div>
        </div>
      </aside>

      {/* Admin Content Canvas */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
        {/* Top Header of the Tab */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <h1 className="text-base font-bold text-white">
              {adminTab === 'dashboard' && 'لوحة المؤشرات والقياس العامة'}
              {adminTab === 'users' && 'دليل المستخدمين وحسابات الأعمال'}
              {adminTab === 'credits' && 'سجل حركات وتدقيق الرصيد (Credits Ledger)'}
              {adminTab === 'subscriptions' && 'باقات وخطط الاستخدام'}
              {adminTab === 'ai-settings' && 'إعدادات مزودي ونماذج الذكاء الاصطناعي'}
              {adminTab === 'audit-logs' && 'سجل النشاط الإداري والعمليات الأمنية'}
            </h1>
            <p className="text-xs text-neutral-400">
              لوحة الإدارة منفصلة تماماً عن واجهة المستخدم وتوفر رقابة كاملة على مهام المنصة
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-neutral-400 text-[11px]">آخر تحديث: قبل دقيقة</span>
            <button
              onClick={() => alert('تم تحديث المؤشرات الإدارية')}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. Dashboard Overview */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                { title: 'إجمالي المستخدمين المسجلين', val: '1,428', note: '+18% هذا الشهر', icon: <Users className="w-4 h-4 text-blue-400" /> },
                { title: 'المهام المنفذة بنجاح', val: '38,940', note: '99.4% نسبة الاكتمال', icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                { title: 'إجمالي حركات الرصيد', val: '124,500', note: 'نقطة معتمدة', icon: <CreditCard className="w-4 h-4 text-amber-400" /> },
                { title: 'النموذج النشط الافتراضي', val: 'Gemini 3.8', note: 'زمن الاستجابة 1.2s', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
              ].map((kpi, idx) => (
                <div key={idx} className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-1`}>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{kpi.title}</span>
                    {kpi.icon}
                  </div>
                  <p className="text-2xl font-bold text-white font-mono tabular-nums">{kpi.val}</p>
                  <p className="text-[11px] text-neutral-400">{kpi.note}</p>
                </div>
              ))}
            </div>

            {/* Task Type Breakdown & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Distribution */}
              <div className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                <h3 className="text-xs font-bold text-white">توزيع المهام الثلاث المعتمدة</h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>1. بحث الويب والمصادر</span>
                      <span className="font-mono">48%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[48%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>2. تحليل وفهرسة الملفات</span>
                      <span className="font-mono">34%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[34%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>3. توليد وتصدير المخرجات</span>
                      <span className="font-mono">18%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[18%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Real-time Audit Snippet */}
              <div className={`lg:col-span-2 p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">أحدث الحركات الرقابية</h3>
                  <button
                    onClick={() => setAdminTab('audit-logs')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    عرض السجل الكامل ←
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {MOCK_ADMIN_AUDIT_LOGS.slice(0, 3).map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-neutral-200">{log.action}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{log.target} · بواسطة {log.actor}</p>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500">{log.timestamp.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Users Management */}
        {adminTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pr-9 pl-3 py-2 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} text-xs text-white placeholder-neutral-500 focus:outline-none`}
                />
              </div>
              <span className="text-xs text-neutral-400">{MOCK_ADMIN_USERS.length} مستخدمين مسجلين</span>
            </div>

            {/* Users Table */}
            <div className={`rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} overflow-hidden shadow-sm`}>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-medium">
                    <tr>
                      <th className="p-3">معرف المستخدم</th>
                      <th className="p-3">الاسم والبريد</th>
                      <th className="p-3">نوع النشاط</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">المهام</th>
                      <th className="p-3">رصيد العمليات</th>
                      <th className="p-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {MOCK_ADMIN_USERS.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3 font-mono text-neutral-400">{u.id}</td>
                        <td className="p-3">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">{u.email}</p>
                        </td>
                        <td className="p-3 text-neutral-300">{u.role}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              u.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {u.status === 'active' ? 'نشط' : 'فترة تجريبية'}
                          </span>
                        </td>
                        <td className="p-3 font-mono tabular-nums text-neutral-200">{u.tasksCount}</td>
                        <td className="p-3 font-mono tabular-nums text-emerald-400 font-semibold">{u.creditsBalance}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[11px]"
                          >
                            عرض التفاصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected User Details Drawer */}
            {selectedUser && (
              <div className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h3 className="text-xs font-bold text-white">تفاصيل ملف المستخدم: {selectedUser.name}</h3>
                  <span className="font-mono text-xs text-neutral-400">{selectedUser.id}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">البريد الإلكتروني:</span>
                    <span className="font-mono text-white">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">تصنيف العمل:</span>
                    <span className="text-white">{selectedUser.role}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">تاريخ الانضمام:</span>
                    <span className="font-mono text-white">{selectedUser.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">الرصيد المتبقي:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedUser.creditsBalance} نقطة</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Credits Ledger */}
        {adminTab === 'credits' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300">
              سجل تدقيق حركات الرصيد: يعرض حركات الاستهلاك والإضافة بدقة بالغة وبأرقام مرجعية ثابتة لضمان الشفافية.
            </div>

            <div className={`rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} overflow-hidden`}>
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="p-3">رقم القيد</th>
                    <th className="p-3">المستخدم</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">البيان / مرجع المهمة</th>
                    <th className="p-3">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {MOCK_CREDIT_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-800/30">
                      <td className="p-3 text-neutral-400">{tx.id}</td>
                      <td className="p-3 font-sans font-medium text-white">{tx.userName}</td>
                      <td className="p-3">
                        <span className="font-sans px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-3 font-bold tabular-nums ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td className="p-3 font-sans text-neutral-300">{tx.taskRef || '-'}</td>
                      <td className="p-3 text-neutral-400 tabular-nums">{tx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Subscription Plans Slots */}
        {adminTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
              هنا يتم عرض وتخصيص بطاقات الخطط وحدود الاستخدام. لم يتم فرض قواعد مالية أو آليات دفع مسبقة في هذه المرحلة بانتظار قرار صاحب المشروع.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'الباقة المجانية / التجربة', desc: 'للمستقلين الجدد لتجربة الوكيل', limit: '20 مهمة شهرياً', files: 'حتى 10MB للملف', activeCount: '840 مستخدم' },
                { name: 'باقة رواد الأعمال والمتاجر', desc: 'لأصحاب المتاجر والمشاريع المصغرة', limit: '100 مهمة شهرياً', files: 'حتى 25MB للملف', activeCount: '480 مستخدم' },
                { name: 'باقة المكاتب والشركات', desc: 'للمكاتب التي تتطلب تحليلاً مكثفاً', limit: '350 مهمة شهرياً', files: 'حتى 50MB للملف', activeCount: '108 مستخدمين' },
              ].map((tier, idx) => (
                <div key={idx} className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                  <div className="border-b border-neutral-800 pb-2">
                    <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                    <p className="text-[11px] text-neutral-400">{tier.desc}</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">حد المهام:</span>
                      <span className="font-semibold text-white">{tier.limit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">حجم الملفات:</span>
                      <span className="font-semibold text-white">{tier.files}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">المشتركون الحاليون:</span>
                      <span className="font-mono text-emerald-400">{tier.activeCount}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('تعديل حدود الباقة (تصور واجهة)')}
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs"
                  >
                    تعديل حصص الباقة
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. AI Settings & Branding */}
        {adminTab === 'ai-settings' && (
          <div className="max-w-2xl space-y-5">
            <div className={`p-5 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-4 text-xs`}>
              <h3 className="text-sm font-bold text-white">إعدادات نماذج الذكاء الاصطناعي</h3>

              <div className="space-y-1.5">
                <label className="block text-neutral-300 font-semibold">النموذج الافتراضي للوكيل:</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className={`w-full p-2.5 rounded-xl ${cfg.surfaceElevatedClass} border ${cfg.borderClass} text-white focus:outline-none`}
                >
                  <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (فائق السرعة والدقة - موصى به)</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (تحليل المستندات المعقدة جداً)</option>
                </select>
                <p className="text-[11px] text-neutral-500">
                  يستخدم النموذج لمهام البحث، تلخيص المستندات، واستخراج التقارير بالعربية.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <div>
                  <p className="font-semibold text-white">تفعيل ميزة توثيق الروابط الحية (Google Grounding):</p>
                  <p className="text-[11px] text-neutral-400">إلزام الوكيل بجلب روابط المصادر الموثوقة لمنع الهلوسة</p>
                </div>
                <input
                  type="checkbox"
                  checked={searchGroundingEnabled}
                  onChange={(e) => setSearchGroundingEnabled(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-neutral-300 font-semibold">الحد الأقصى لحجم الملف الواحد المرفوع (MB):</label>
                <input
                  type="number"
                  value={maxUploadLimitMB}
                  onChange={(e) => setMaxUploadLimitMB(parseInt(e.target.value, 10))}
                  className={`w-full p-2.5 rounded-xl ${cfg.surfaceElevatedClass} border ${cfg.borderClass} text-white focus:outline-none font-mono`}
                />
              </div>

              {savedSettingsNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>تم حفظ إعدادات النموذج والهوية بنجاح.</span>
                </div>
              )}

              <button
                onClick={() => {
                  setSavedSettingsNotice(true);
                  setTimeout(() => setSavedSettingsNotice(false), 2500);
                }}
                className={`py-2 px-4 rounded-xl ${cfg.buttonPrimaryClass} font-semibold`}
              >
                حفظ الإعدادات الإدارية
              </button>
            </div>
          </div>
        )}

        {/* 6. Admin Audit Logs */}
        {adminTab === 'audit-logs' && (
          <div className="space-y-4">
            <div className={`rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} overflow-hidden`}>
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="p-3">معرف السجل</th>
                    <th className="p-3">المشرف المسؤول</th>
                    <th className="p-3">الإجراء المنفذ</th>
                    <th className="p-3">الهدف المتأثر</th>
                    <th className="p-3">عنوان الـ IP</th>
                    <th className="p-3">التوقيت الدقيق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {MOCK_ADMIN_AUDIT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-800/30">
                      <td className="p-3 text-neutral-400">{log.id}</td>
                      <td className="p-3 text-white">{log.actor}</td>
                      <td className="p-3 font-sans font-medium text-neutral-200">{log.action}</td>
                      <td className="p-3 text-blue-400">{log.target}</td>
                      <td className="p-3 text-neutral-400">{log.ip}</td>
                      <td className="p-3 text-neutral-500 tabular-nums">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

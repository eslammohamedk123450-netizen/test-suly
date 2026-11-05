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
  Snowflake,
  Unlock,
  MinusCircle,
  PlusCircle,
  X,
  ToggleLeft,
  ToggleRight,
  Key,
} from 'lucide-react';
import { VisualTheme, AdminUser, CreditTransaction, AdminAuditLog, AIProviderConfig } from '../types';
import { THEME_CONFIGS } from '../themeTokens';
import {
  MOCK_ADMIN_USERS,
  MOCK_CREDIT_TRANSACTIONS,
  MOCK_ADMIN_AUDIT_LOGS,
  MOCK_AI_PROVIDERS,
} from '../mockData';

interface AdminPanelProps {
  theme: VisualTheme;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'users' | 'credits' | 'subscriptions' | 'ai-settings' | 'audit-logs'
  >('dashboard');

  // Users State (Interactive Local Simulation)
  const [usersList, setUsersList] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(MOCK_ADMIN_USERS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Credit Transactions (Interactive Local Simulation)
  const [transactions, setTransactions] = useState<CreditTransaction[]>(MOCK_CREDIT_TRANSACTIONS);

  // Credit Action Modal State (Interactive Local Simulation)
  const MAX_REASON_LENGTH = 120; // حد إدخال تجريبي للواجهة

  const [creditActionModal, setCreditActionModal] = useState<{
    isOpen: boolean;
    step: 'input' | 'confirm';
    actionType: 'add' | 'deduct' | 'freeze' | 'release';
    targetUser: AdminUser | null;
    amountInput: string;
    reasonInput: string;
    validatedAmount: number;
    validatedReason: string;
    errors: {
      amount?: string;
      reason?: string;
    };
  }>({
    isOpen: false,
    step: 'input',
    actionType: 'add',
    targetUser: null,
    amountInput: '10',
    reasonInput: '',
    validatedAmount: 10,
    validatedReason: '',
    errors: {},
  });

  // Subscription Action Confirmation State
  const [subActionModal, setSubActionModal] = useState<{
    isOpen: boolean;
    targetUser: AdminUser | null;
    newStatus: 'active' | 'suspended' | 'trial';
  }>({
    isOpen: false,
    targetUser: null,
    newStatus: 'active',
  });

  // AI Providers & Models State
  const [providers, setProviders] = useState<AIProviderConfig[]>(MOCK_AI_PROVIDERS);
  const [isEditProviderModalOpen, setIsEditProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProviderConfig | null>(null);

  // Notice Toast for Simulation
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSimulationToast(msg);
    setTimeout(() => setSimulationToast(null), 3500);
  };

  // Helper: التحقق الصارم من مدخلات إجراء الرصيد التجريبي
  const validateCreditAction = (
    actionType: 'add' | 'deduct' | 'freeze' | 'release',
    targetUser: AdminUser | null,
    amountRaw: string,
    reasonRaw: string
  ): {
    isValid: boolean;
    amount: number;
    reason: string;
    errors: { amount?: string; reason?: string };
  } => {
    const errs: { amount?: string; reason?: string } = {};

    // 1. فحص المقدار: يجب أن يكون عددًا صحيحًا موجبًا (رفض الصفر، السالب، الكسور، الحروف، الفراغ)
    const trimmedAmount = (amountRaw || '').trim();
    let parsedAmount = 0;

    if (!trimmedAmount) {
      errs.amount = 'أدخل عددًا صحيحًا أكبر من صفر.';
    } else if (!/^[1-9]\d*$/.test(trimmedAmount)) {
      errs.amount = 'أدخل عددًا صحيحًا أكبر من صفر.';
    } else {
      parsedAmount = parseInt(trimmedAmount, 10);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        errs.amount = 'أدخل عددًا صحيحًا أكبر من صفر.';
      }
    }

    // 2. فحص السبب: إلزامي بعد إزالة المسافات، مع سقف لطول النص التجريبي
    const trimmedReason = (reasonRaw || '').trim();
    if (!trimmedReason) {
      errs.reason = 'أدخل سببًا تجريبيًا للإجراء.';
    } else if (trimmedReason.length > MAX_REASON_LENGTH) {
      errs.reason = `السبب يتجاوز الحد التجريبي للواجهة (${MAX_REASON_LENGTH} حرفاً).`;
    }

    // 3. فحص الرصيد بحسب نوع العملية التجريبية
    if (!errs.amount && targetUser) {
      const currentUser = usersList.find((u) => u.id === targetUser.id) || targetUser;

      if (actionType === 'deduct' || actionType === 'freeze') {
        if (parsedAmount > currentUser.creditsAvailable) {
          errs.amount = `المقدار المطلوب (${parsedAmount}) يتجاوز الرصيد المتاح في بيانات الاختبار (${currentUser.creditsAvailable}).`;
        }
      } else if (actionType === 'release') {
        if (parsedAmount > currentUser.creditsFrozen) {
          errs.amount = `المقدار المطلوب (${parsedAmount}) يتجاوز الرصيد المجمّد في بيانات الاختبار (${currentUser.creditsFrozen}).`;
        }
      }
    }

    return {
      isValid: Object.keys(errs).length === 0,
      amount: parsedAmount,
      reason: trimmedReason,
      errors: errs,
    };
  };

  // الانتقال إلى شاشة المراجعة والتأكيد بعد التحقق
  const handleProceedToReview = () => {
    const val = validateCreditAction(
      creditActionModal.actionType,
      creditActionModal.targetUser,
      creditActionModal.amountInput,
      creditActionModal.reasonInput
    );

    if (!val.isValid) {
      setCreditActionModal((prev) => ({
        ...prev,
        errors: val.errors,
      }));
      return;
    }

    setCreditActionModal((prev) => ({
      ...prev,
      step: 'confirm',
      validatedAmount: val.amount,
      validatedReason: val.reason,
      errors: {},
    }));
  };

  // تنفيذ المحاكاة بعد التحقق النهائي
  const executeCreditSimulation = () => {
    if (!creditActionModal.targetUser) return;
    const { actionType, targetUser, amountInput, reasonInput } = creditActionModal;

    // إعادة التحقق بدقة قبل التنفيذ لمنع أي عدم اتساق
    const val = validateCreditAction(actionType, targetUser, amountInput, reasonInput);
    if (!val.isValid) {
      setCreditActionModal((prev) => ({
        ...prev,
        step: 'input',
        errors: val.errors,
      }));
      showToast('تعذر تنفيذ المحاكاة: توجد بيانات غير صالحة.');
      return;
    }

    const confirmedAmount = val.amount;
    const confirmedReason = val.reason;

    // فحص إمكانية تنفيذ العملية بالكامل دون تجزئة
    const currentUser = usersList.find((u) => u.id === targetUser.id) || targetUser;
    if (actionType === 'deduct' || actionType === 'freeze') {
      if (confirmedAmount > currentUser.creditsAvailable) {
        setCreditActionModal((prev) => ({
          ...prev,
          step: 'input',
          errors: {
            amount: `تعذر التنفيذ: المقدار (${confirmedAmount}) يتجاوز الرصيد المتاح في بيانات الاختبار (${currentUser.creditsAvailable}).`,
          },
        }));
        showToast('تعذر تنفيذ المحاكاة بالكامل.');
        return;
      }
    }
    if (actionType === 'release') {
      if (confirmedAmount > currentUser.creditsFrozen) {
        setCreditActionModal((prev) => ({
          ...prev,
          step: 'input',
          errors: {
            amount: `تعذر التنفيذ: المقدار (${confirmedAmount}) يتجاوز الرصيد المجمّد في بيانات الاختبار (${currentUser.creditsFrozen}).`,
          },
        }));
        showToast('تعذر تنفيذ المحاكاة بالكامل.');
        return;
      }
    }

    // تطبيق التغيير في الذاكرة
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== targetUser.id) return u;
        let newAvail = u.creditsAvailable;
        let newFrozen = u.creditsFrozen;

        if (actionType === 'add') newAvail += confirmedAmount;
        if (actionType === 'deduct') newAvail -= confirmedAmount;
        if (actionType === 'freeze') {
          newAvail -= confirmedAmount;
          newFrozen += confirmedAmount;
        }
        if (actionType === 'release') {
          newFrozen -= confirmedAmount;
          newAvail += confirmedAmount;
        }

        const updated = { ...u, creditsAvailable: newAvail, creditsFrozen: newFrozen };
        if (selectedUser?.id === u.id) setSelectedUser(updated);
        return updated;
      })
    );

    // تسجيل العملية في دفتر الحركات بالقيمة والسبب المطابقين تماماً
    const actionLabel =
      actionType === 'add'
        ? 'إضافة رصيد (محاكاة)'
        : actionType === 'deduct'
        ? 'خصم رصيد (محاكاة)'
        : actionType === 'freeze'
        ? 'تجميد رصيد (محاكاة)'
        : 'تحرير رصيد (محاكاة)';

    const newTx: CreditTransaction = {
      id: `TX-TEST-${Math.floor(100 + Math.random() * 900)}`,
      userId: targetUser.id,
      userName: targetUser.name,
      type: actionLabel,
      amount: actionType === 'deduct' || actionType === 'freeze' ? -confirmedAmount : confirmedAmount,
      reason: confirmedReason,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' (افتراضي)',
      executedBy: 'admin@example.com',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCreditActionModal({
      isOpen: false,
      step: 'input',
      actionType: 'add',
      targetUser: null,
      amountInput: '10',
      reasonInput: '',
      validatedAmount: 10,
      validatedReason: '',
      errors: {},
    });
    showToast('تمت المحاكاة فقط، لم يتغير أي رصيد فعلي.');
  };

  // Handle Subscription Status Simulation
  const executeSubscriptionStatusSimulation = () => {
    if (!subActionModal.targetUser) return;
    const { targetUser, newStatus } = subActionModal;

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== targetUser.id) return u;
        const updated = { ...u, status: newStatus };
        if (selectedUser?.id === u.id) setSelectedUser(updated);
        return updated;
      })
    );

    setSubActionModal({ isOpen: false, targetUser: null, newStatus: 'active' });
    showToast('تمت المحاكاة فقط، لم يتغير أي اشتراك فعلي.');
  };

  return (
    <div className={`min-h-[calc(100vh-84px)] ${cfg.bgClass} text-neutral-100 flex flex-col md:flex-row transition-colors duration-200 relative`}>
      {/* Simulation Toast */}
      {simulationToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-emerald-500/60 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-2xl">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{simulationToast}</span>
        </div>
      )}

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
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  لوحة تجريبية
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">واجهة تصور إداري مستقل</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="p-3 space-y-1 text-xs">
          {[
            { id: 'dashboard', label: 'المؤشرات العامة (افتراضية)', icon: <Activity className="w-4 h-4" /> },
            { id: 'users', label: 'المستخدمون وتفاصيلهم', icon: <Users className="w-4 h-4" /> },
            { id: 'credits', label: 'إدارة وسجل الرصيد', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'subscriptions', label: 'إدارة الاشتراكات (تصور)', icon: <Layers className="w-4 h-4" /> },
            { id: 'ai-settings', label: 'إعدادات مزودي ونماذج AI', icon: <Sliders className="w-4 h-4" /> },
            { id: 'audit-logs', label: 'سجلات النشاط (بيانات اختبار)', icon: <FileCode className="w-4 h-4" /> },
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
              <p className="text-xs font-semibold text-white">مشرف تجريبي</p>
              <p className="text-[10px] text-neutral-400 font-mono truncate">admin@example.com</p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-amber-300 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3" />
            <span>جلسة اختبارية لتصور الواجهة فقط</span>
          </div>
        </div>
      </aside>

      {/* Admin Content Canvas */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
        {/* Top Header of the Tab */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">
                {adminTab === 'dashboard' && 'لوحة المؤشرات والقياس العامة'}
                {adminTab === 'users' && 'دليل المستخدمين وإدارة الحسابات'}
                {adminTab === 'credits' && 'إدارة الرصيد وسجل الحركات (محاكاة واجهة)'}
                {adminTab === 'subscriptions' && 'تصور إدارة حالات الاشتراكات'}
                {adminTab === 'ai-settings' && 'إدارة مزودي ونماذج الذكاء الاصطناعي (واجهة فقط)'}
                {adminTab === 'audit-logs' && 'سجل النشاط الإداري (سجل اختباري تمثيلي)'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                بيانات تجريبية
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              واجهة مخصصة لدراسة تجربة الإشراف ورقابة المهام — العمليات المعروضة محاكاة محلية لا تؤثر على أي أنظمة فعلية.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-neutral-500 text-[11px]">محاكاة محلية</span>
            <button
              onClick={() => showToast('محاكاة: تم تحديث البيانات التجريبية.')}
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
                { title: 'إجمالي المستخدمين (تمثيلي)', val: '1,420', note: 'رقم افتراضي للتصميم فقط — غير معتمد', icon: <Users className="w-4 h-4 text-blue-400" /> },
                { title: 'المهام المنفذة (تمثيلي)', val: '38,940', note: 'رقم افتراضي للتصميم فقط — غير معتمد', icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                { title: 'رصيد العمليات المتداول', val: 'غير محدد', note: 'لم تُعتمد قواعد الرصيد بعد', icon: <CreditCard className="w-4 h-4 text-amber-400" /> },
                { title: 'مزود الذكاء الاصطناعي', val: 'مزود تجريبي', note: 'محاكاة واجهة — لا يوجد استدعاء فعلي', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
              ].map((kpi, idx) => (
                <div key={idx} className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-1`}>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{kpi.title}</span>
                    {kpi.icon}
                  </div>
                  <p className="text-xl font-bold text-white font-mono tabular-nums">{kpi.val}</p>
                  <p className="text-[10px] text-amber-300/80">{kpi.note}</p>
                </div>
              ))}
            </div>

            {/* Task Type Breakdown & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">توزيع المهام الثلاث (تمثيلي)</h3>
                  <span className="text-[9px] text-amber-400">بيانات تجريبية</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>1. بحث الويب وتوثيق المراجع</span>
                      <span className="font-mono">نسبة افتراضية</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[50%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>2. تحليل الملفات واستخراج البنود</span>
                      <span className="font-mono">نسبة افتراضية</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[35%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>3. توليد وتصدير المخرجات</span>
                      <span className="font-mono">نسبة افتراضية</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[15%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Real-time Audit Snippet */}
              <div className={`lg:col-span-2 p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">أحدث الحركات الرقابية الافتراضية</h3>
                    <span className="text-[9px] text-amber-400">سجل اختباري</span>
                  </div>
                  <button
                    onClick={() => setAdminTab('audit-logs')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    عرض السجل الكامل ←
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {MOCK_ADMIN_AUDIT_LOGS.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-neutral-200">{log.action}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{log.target} · بواسطة {log.actor}</p>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500">{log.timestamp}</span>
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
                  placeholder="ابحث بالاسم أو البريد التجريبي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pr-9 pl-3 py-2 rounded-xl ${cfg.surfaceClass} border ${cfg.borderClass} text-xs text-white placeholder-neutral-500 focus:outline-none`}
                />
              </div>
              <span className="text-xs text-amber-400 font-mono">
                {usersList.length} مستخدمين تجريبيين (عناصر اختبارية)
              </span>
            </div>

            {/* Users Table */}
            <div className={`rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} overflow-hidden shadow-sm`}>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-medium">
                    <tr>
                      <th className="p-3">المعرف التجريبي</th>
                      <th className="p-3">الاسم والبريد (.example)</th>
                      <th className="p-3">النشاط التمثيلي</th>
                      <th className="p-3">حالة الاشتراك</th>
                      <th className="p-3">الرصيد المتاح</th>
                      <th className="p-3">الرصيد المجمّد</th>
                      <th className="p-3">إجراءات الرصيد والاشتراك</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {usersList
                      .filter((u) => u.name.includes(searchQuery) || u.email.includes(searchQuery))
                      .map((u) => (
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
                                  : u.status === 'trial'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {u.status === 'active' ? 'نشط (اختباري)' : u.status === 'trial' ? 'فترة تجريبية' : 'معلق'}
                            </span>
                          </td>
                          <td className="p-3 font-mono tabular-nums text-emerald-400 font-semibold">
                            {u.creditsAvailable}
                            <span className="text-[9px] text-neutral-500 block font-sans">افتراضي</span>
                          </td>
                          <td className="p-3 font-mono tabular-nums text-amber-400 font-semibold">
                            {u.creditsFrozen}
                            <span className="text-[9px] text-neutral-500 block font-sans">افتراضي</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[10px]"
                              >
                                عرض
                              </button>
                              <button
                                onClick={() =>
                                  setCreditActionModal({
                                    isOpen: true,
                                    step: 'input',
                                    actionType: 'add',
                                    targetUser: u,
                                    amountInput: '10',
                                    reasonInput: '',
                                    validatedAmount: 10,
                                    validatedReason: '',
                                    errors: {},
                                  })
                                }
                                className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-[10px]"
                                title="إجراء رصيد (محاكاة)"
                              >
                                إدارة رصيد
                              </button>
                            </div>
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
                  <h3 className="text-xs font-bold text-white">تفاصيل الملف التجريبي: {selectedUser.name}</h3>
                  <span className="font-mono text-xs text-amber-400">{selectedUser.id}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">البريد التجريبي:</span>
                    <span className="font-mono text-white">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">الرصيد المتاح:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedUser.creditsAvailable} (رقم افتراضي للتصميم فقط)</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">الرصيد المجمّد:</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedUser.creditsFrozen} (رقم افتراضي للتصميم فقط)</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">حالة الاشتراك:</span>
                    <span className="text-white">{selectedUser.status === 'active' ? 'نشط (اختباري)' : 'معلق'}</span>
                  </div>
                </div>

                {/* Direct Action triggers on selected user */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-400">إجراءات الرصيد النموذجية:</span>
                  <button
                    onClick={() =>
                      setCreditActionModal({
                        isOpen: true,
                        step: 'input',
                        actionType: 'add',
                        targetUser: selectedUser,
                        amountInput: '10',
                        reasonInput: 'إضافة تشجيعية تجريبية',
                        validatedAmount: 10,
                        validatedReason: '',
                        errors: {},
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>إضافة رصيد (محاكاة)</span>
                  </button>
                  <button
                    onClick={() =>
                      setCreditActionModal({
                        isOpen: true,
                        step: 'input',
                        actionType: 'deduct',
                        targetUser: selectedUser,
                        amountInput: selectedUser.creditsAvailable > 0 ? Math.min(5, selectedUser.creditsAvailable).toString() : '5',
                        reasonInput: 'تسوية خصم تجريبية',
                        validatedAmount: 5,
                        validatedReason: '',
                        errors: {},
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs flex items-center gap-1"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>خصم رصيد (محاكاة)</span>
                  </button>
                  <button
                    onClick={() =>
                      setCreditActionModal({
                        isOpen: true,
                        step: 'input',
                        actionType: 'freeze',
                        targetUser: selectedUser,
                        amountInput: selectedUser.creditsAvailable > 0 ? Math.min(5, selectedUser.creditsAvailable).toString() : '5',
                        reasonInput: 'حجز مؤقت لمهمة قيد الانتظار',
                        validatedAmount: 5,
                        validatedReason: '',
                        errors: {},
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>تجميد رصيد (محاكاة)</span>
                  </button>
                  <button
                    onClick={() =>
                      setCreditActionModal({
                        isOpen: true,
                        step: 'input',
                        actionType: 'release',
                        targetUser: selectedUser,
                        amountInput: selectedUser.creditsFrozen > 0 ? Math.min(5, selectedUser.creditsFrozen).toString() : '5',
                        reasonInput: 'تحرير رصيد محجوز',
                        validatedAmount: 5,
                        validatedReason: '',
                        errors: {},
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>تحرير رصيد (محاكاة)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Credits Management & Ledger */}
        {adminTab === 'credits' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              تنبيه: جميع عمليات إضافة وخصم وتجميد الرصيد أدناه محاكاة واجهات محلية للاختبار فقط. لم تُعتمد قواعد الرصيد أو سياسات الخصم بعد.
            </div>

            <div className={`rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} overflow-hidden`}>
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white">سجل حركات وتدقيق الرصيد (محاكاة)</span>
                <span className="text-[10px] text-amber-400 font-mono">بيانات تجريبية</span>
              </div>
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="p-3">رقم القيد</th>
                    <th className="p-3">المستخدم التجريبي</th>
                    <th className="p-3">نوع الحركة (محاكاة)</th>
                    <th className="p-3">المقدار</th>
                    <th className="p-3">السبب / البيان</th>
                    <th className="p-3">المنفّذ</th>
                    <th className="p-3">التوقيت الافتراضي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-800/30">
                      <td className="p-3 text-neutral-400">{tx.id}</td>
                      <td className="p-3 font-sans font-medium text-white">{tx.userName}</td>
                      <td className="p-3">
                        <span className="font-sans px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-3 font-bold tabular-nums ${tx.amount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td className="p-3 font-sans text-neutral-300">{tx.reason}</td>
                      <td className="p-3 text-neutral-400">{tx.executedBy}</td>
                      <td className="p-3 text-neutral-500 tabular-nums">{tx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Subscriptions Management Simulation */}
        {adminTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
              واجهة تصور إدارة الاشتراكات: تتيح للمشرف محاكاة تغيير حالة الاشتراك (تفعيل، إيقاف مؤقت، تعليق) مع شاشة تأكيد. لم يتم وضع أسعار أو مدد أو قواعد تجديد غير معتمدة.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {usersList.map((user) => (
                <div key={user.id} className={`p-4 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-3`}>
                  <div className="border-b border-neutral-800 pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{user.name}</h3>
                      <span className="text-[10px] text-neutral-400 font-mono">{user.id}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono">{user.email}</p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">حالة الاشتراك الحالية:</span>
                      <span className="font-semibold text-amber-300">
                        {user.status === 'active' ? 'نشط (اختباري)' : user.status === 'trial' ? 'فترة تجريبية' : 'معلق'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">الخطة:</span>
                      <span className="text-neutral-300">الخطة غير محددة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">موعد التجديد:</span>
                      <span className="text-neutral-300">موعد التجديد غير محدد</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-1.5">
                    {user.status === 'active' ? (
                      <button
                        onClick={() =>
                          setSubActionModal({
                            isOpen: true,
                            targetUser: user,
                            newStatus: 'suspended',
                          })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-medium"
                      >
                        تعليق الاشتراك (محاكاة)
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setSubActionModal({
                            isOpen: true,
                            targetUser: user,
                            newStatus: 'active',
                          })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                      >
                        تفعيل الاشتراك (محاكاة)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. AI Providers & Models Management */}
        {adminTab === 'ai-settings' && (
          <div className="space-y-5 max-w-3xl">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
              واجهة تصميم لإدارة مزودي ونماذج الذكاء الاصطناعي: عناصر تمثيلية بالكامل بدون استدعاء أي مزود حقيقي أو طلب مفاتيح API فعلية.
            </div>

            <div className={`p-5 rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} space-y-4`}>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">مزودو الذكاء الاصطناعي المسجلون (عناصر اختبارية)</h3>
                  <p className="text-[11px] text-neutral-400">يمكن تخصيص النموذج المفضل لكل مهمة من المهام الثلاث</p>
                </div>
                <button
                  onClick={() => {
                    const newProvider: AIProviderConfig = {
                      id: `provider-test-${Date.now()}`,
                      name: 'مزود اختبار جديد (تمثيلي)',
                      status: 'active',
                      mockKeyDisplay: 'sk-mock-new-••••••••',
                      models: [
                        { id: 'm-sample', name: 'نموذج افتراضي جديد', assignedTask: 'عام' },
                      ],
                    };
                    setProviders((prev) => [...prev, newProvider]);
                    showToast('محاكاة واجهة: تمت إضافة مزود تجريبي جديد بالقائمة.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مزود (محاكاة)</span>
                </button>
              </div>

              {/* Providers List */}
              <div className="space-y-3">
                {providers.map((prov) => (
                  <div key={prov.id} className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-white text-xs">{prov.name}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                            prov.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {prov.status === 'active' ? 'مفعل (محاكاة)' : 'معطل'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setProviders((prev) =>
                              prev.map((p) =>
                                p.id === prov.id
                                  ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
                                  : p
                              )
                            );
                            showToast('محاكاة واجهة: تم تبديل حالة المزود التجريبي.');
                          }}
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          {prov.status === 'active' ? 'تعطيل' : 'تفعيل'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/80">
                      <Key className="w-3.5 h-3.5 text-neutral-500" />
                      <span>مفتاح API التمثيلي:</span>
                      <span className="text-neutral-300">{prov.mockKeyDisplay}</span>
                      <span className="text-[10px] text-amber-400 font-sans mr-auto">
                        (قيمة مشفرة افتراضية للعرض فقط)
                      </span>
                    </div>

                    {/* Task assignment */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-neutral-300">النماذج المسندة للمهام:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {prov.models.map((mod) => (
                          <div key={mod.id} className="p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60 flex items-center justify-between">
                            <span className="text-neutral-200">{mod.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium">
                              مخصص لـ: {mod.assignedTask || 'عام'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                * تنبيه الأمان: لا يطلب هذا النموذج أي مفاتيح API حقيقية ولا يخزنها ولا يستدعي أي مزود خارجي.
              </div>
            </div>
          </div>
        )}

        {/* 6. Admin Audit Logs */}
        {adminTab === 'audit-logs' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
              <span>سجل النشاط الإداري: جميع المدخلات أدناه بيانات اختبار تمثيلية للاسترشاد فقط.</span>
              <span className="text-[10px] text-amber-400 font-mono">سجل اختباري</span>
            </div>

            <div className={`rounded-2xl ${cfg.surfaceClass} border ${cfg.borderClass} overflow-hidden`}>
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="p-3">معرف السجل</th>
                    <th className="p-3">المشرف (.example)</th>
                    <th className="p-3">الإجراء المنفذ (محاكاة)</th>
                    <th className="p-3">الهدف</th>
                    <th className="p-3">عنوان IP التجريبي</th>
                    <th className="p-3">التوقيت الافتراضي</th>
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

      {/* Credit Action Modal (Input & Confirmation Steps) */}
      {creditActionModal.isOpen && creditActionModal.targetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${cfg.surfaceClass} border ${cfg.borderClass} rounded-2xl p-5 shadow-2xl text-right space-y-4`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>
                  {creditActionModal.actionType === 'add' && 'محاكاة: إضافة رصيد'}
                  {creditActionModal.actionType === 'deduct' && 'محاكاة: خصم رصيد'}
                  {creditActionModal.actionType === 'freeze' && 'محاكاة: تجميد رصيد'}
                  {creditActionModal.actionType === 'release' && 'محاكاة: تحرير رصيد محجوز'}
                </span>
              </h3>
              <button
                onClick={() => setCreditActionModal({ ...creditActionModal, isOpen: false })}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {creditActionModal.step === 'input' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-1">المستخدم المستهدف:</span>
                  <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 font-bold text-white">
                    {creditActionModal.targetUser.name} ({creditActionModal.targetUser.id})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 block">المتاح حالياً:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {creditActionModal.targetUser.creditsAvailable}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 block">المجمّد حالياً:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {creditActionModal.targetUser.creditsFrozen}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-300 font-semibold">المقدار التجريبي:</label>
                    <span className="text-[10px] text-neutral-500">أعداد صحيحة موجبة فقط (محاكاة)</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="أدخل عددًا صحيحًا أكبر من صفر (مثال: 10)"
                    value={creditActionModal.amountInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreditActionModal((prev) => ({
                        ...prev,
                        amountInput: val,
                        errors: { ...prev.errors, amount: undefined },
                      }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-neutral-950 border font-mono text-xs focus:outline-none transition-colors ${
                      creditActionModal.errors.amount
                        ? 'border-red-500 text-red-200 focus:border-red-400'
                        : 'border-neutral-800 text-white focus:border-amber-500/50'
                    }`}
                  />
                  {creditActionModal.errors.amount && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-sans">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span>{creditActionModal.errors.amount}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-300 font-semibold">سبب الإجراء:</label>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {creditActionModal.reasonInput.trim().length}/{MAX_REASON_LENGTH} (حد إدخال تجريبي للواجهة)
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="مثال: تسوية تجريبية، حجز مهمة اختبار، منحة ترحيبية..."
                    value={creditActionModal.reasonInput}
                    maxLength={MAX_REASON_LENGTH}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreditActionModal((prev) => ({
                        ...prev,
                        reasonInput: val,
                        errors: { ...prev.errors, reason: undefined },
                      }));
                    }}
                    className={`w-full p-2.5 rounded-xl bg-neutral-950 border text-xs focus:outline-none transition-colors ${
                      creditActionModal.errors.reason
                        ? 'border-red-500 text-red-200 focus:border-red-400'
                        : 'border-neutral-800 text-white focus:border-amber-500/50'
                    }`}
                  />
                  {creditActionModal.errors.reason && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-sans">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span>{creditActionModal.errors.reason}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleProceedToReview}
                    className={`flex-1 py-2 rounded-xl ${cfg.buttonPrimaryClass} font-semibold text-xs`}
                  >
                    الانتقال للمراجعة والتأكيد
                  </button>
                  <button
                    onClick={() => setCreditActionModal({ ...creditActionModal, isOpen: false })}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              /* Review & Confirmation Step */
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>مراجعة إجراء المحاكاة:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    أنت على وشك تنفيذ محاكاة{' '}
                    <strong className="text-white">
                      {creditActionModal.actionType === 'add'
                        ? 'إضافة'
                        : creditActionModal.actionType === 'deduct'
                        ? 'خصم'
                        : creditActionModal.actionType === 'freeze'
                        ? 'تجميد'
                        : 'تحرير'}
                    </strong>{' '}
                    بمقدار <strong className="text-white font-mono">{creditActionModal.validatedAmount} نقطة</strong> للمستخدم{' '}
                    <strong className="text-white">{creditActionModal.targetUser.name}</strong>.
                  </p>
                  <p className="text-[10px] text-amber-300/80 pt-1">
                    السبب المسجل: {creditActionModal.validatedReason}
                  </p>
                </div>

                <p className="text-[11px] text-neutral-400">
                  تأكيد: هذه العملية محاكاة واجهة محلية في الذاكرة فقط، ولن تؤثر على أي رصيد حقيقي.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={executeCreditSimulation}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    تأكيد المحاكاة الآن
                  </button>
                  <button
                    onClick={() => setCreditActionModal((prev) => ({ ...prev, step: 'input' }))}
                    className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
                  >
                    رجوع للتعديل
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Action Confirmation Modal */}
      {subActionModal.isOpen && subActionModal.targetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${cfg.surfaceClass} border ${cfg.borderClass} rounded-2xl p-5 shadow-2xl text-right space-y-4`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-bold text-white">تأكيد محاكاة تعديل حالة الاشتراك</h3>
              <button
                onClick={() => setSubActionModal({ isOpen: false, targetUser: null, newStatus: 'active' })}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-200 leading-relaxed">
              هل تؤكد محاكاة تغيير حالة اشتراك المستخدم{' '}
              <strong className="text-white">{subActionModal.targetUser.name}</strong> إلى{' '}
              <strong className="text-amber-300">
                {subActionModal.newStatus === 'active' ? 'نشط' : 'معلق'}
              </strong>
              ؟
            </p>

            <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 text-[10px] text-neutral-400">
              * تنبيه: التغيير محاكاة محلية فقط، ولا توجد أي خدمات اشتراك أو مدفوعات حقيقية تعمل في هذا النموذج.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={executeSubscriptionStatusSimulation}
                className={`flex-1 py-2 rounded-xl ${cfg.buttonPrimaryClass} font-semibold text-xs`}
              >
                تأكيد المحاكاة
              </button>
              <button
                onClick={() => setSubActionModal({ isOpen: false, targetUser: null, newStatus: 'active' })}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

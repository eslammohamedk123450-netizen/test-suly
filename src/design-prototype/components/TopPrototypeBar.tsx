import React from 'react';
import {
  Monitor,
  Smartphone,
  ShieldAlert,
  Layers,
  FileText,
  Workflow,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { PrototypeView, VisualTheme } from '../types';
import { THEME_CONFIGS } from '../themeTokens';

interface TopPrototypeBarProps {
  currentView: PrototypeView;
  onSelectView: (view: PrototypeView) => void;
  currentTheme: VisualTheme;
  onSelectTheme: (theme: VisualTheme) => void;
  onSwitchToOriginalApp?: () => void;
}

export const TopPrototypeBar: React.FC<TopPrototypeBarProps> = ({
  currentView,
  onSelectView,
  currentTheme,
  onSelectTheme,
  onSwitchToOriginalApp,
}) => {
  const activeCfg = THEME_CONFIGS[currentTheme];

  const views: { id: PrototypeView; label: string; icon: React.ReactNode }[] = [
    { id: 'web-app', label: 'تطبيق الويب', icon: <Monitor className="w-4 h-4" /> },
    { id: 'mobile-app', label: 'تطبيق الهاتف', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'admin-panel', label: 'لوحة الإدارة', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'states-matrix', label: 'معرض الحالات (9)', icon: <Layers className="w-4 h-4" /> },
    { id: 'flow-visualizer', label: 'التدفقات المقترحة', icon: <Workflow className="w-4 h-4" /> },
    { id: 'design-doc', label: 'وثيقة المرحلة 1', icon: <FileText className="w-4 h-4" /> },
  ];

  const themes: { id: VisualTheme; label: string; colorDot: string }[] = [
    { id: 'deep-azure', label: 'النيلي الذكي (الموصى به)', colorDot: 'bg-blue-500' },
    { id: 'obsidian-gold', label: 'الذهب والأوبسيديان', colorDot: 'bg-amber-400' },
    { id: 'technical-emerald', label: 'الرمادي والزمرد', colorDot: 'bg-emerald-500' },
  ];

  return (
    <div className="sticky top-0 z-50 flex flex-col shadow-lg">
      {/* Universal Prominent Disclaimer Banner across ALL Views */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300">
            نموذج تصميم تجريبي — البيانات والعمليات المعروضة افتراضية ولا تمثل حسابًا أو خدمة فعلية.
          </span>
        </div>
        {onSwitchToOriginalApp && (
          <button
            onClick={onSwitchToOriginalApp}
            className="flex items-center gap-1 text-[11px] font-bold text-white hover:text-amber-300 transition-colors underline mr-2 shrink-0"
          >
            <span>العودة لتطبيق SULY الفعلي</span>
            <ArrowRight className="w-3.5 h-3.5 transform -scale-x-100" />
          </button>
        )}
      </div>

      {/* Main Prototype Navigation Bar */}
      <header className="border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Brand & Stage badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center font-bold text-white text-xs shadow-md">
              S
            </span>
            <span className="font-bold text-white tracking-wide text-sm">SULY AI</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
            استعراض تصميم المرحلة الأولى
          </span>
        </div>

        {/* Screen & View Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {views.map((v) => {
            const isActive = currentView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelectView(v.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Picker */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden xl:inline text-[11px] text-neutral-400">السمة البصرية:</span>
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => onSelectTheme(th.id)}
                title={th.label}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                  currentTheme === th.id
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${th.colorDot}`} />
                <span className="hidden lg:inline">{th.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
};

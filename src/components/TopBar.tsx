import React, { useState, useRef, useEffect } from 'react';
import {
  PanelLeft,
  ChevronDown,
  Sparkles,
  Brain,
  Zap,
  Cpu,
  Share2,
  Globe,
  Ghost,
  Check,
  Headphones,
  SlidersHorizontal,
} from 'lucide-react';
import { ModelOption, AppSettings } from '../types';

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  models: ModelOption[];
  isTemporary: boolean;
  onToggleTemporary: () => void;
  onShare: () => void;
  onOpenVoiceMode: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  models,
  isTemporary,
  onToggleTemporary,
  onShare,
  onOpenVoiceMode,
  settings,
  onUpdateSettings,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRtl = settings.language === 'ar';
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (iconType: string) => {
    switch (iconType) {
      case 'sparkle':
        return <Sparkles size={16} className="text-emerald-500" />;
      case 'brain':
        return <Brain size={16} className="text-purple-400" />;
      case 'zap':
        return <Zap size={16} className="text-amber-400" />;
      case 'cpu':
        return <Cpu size={16} className="text-blue-400" />;
      default:
        return <Sparkles size={16} className="text-emerald-500" />;
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-[52px] px-3 bg-white/90 dark:bg-[#212121]/90 backdrop-blur-md border-b border-[#e5e5e5] dark:border-white/5 select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Left zone: Sidebar toggle + Model Selector */}
      <div className="flex items-center gap-2">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#2f2f2f] transition-colors"
            title={isRtl ? 'فتح القائمة الجانبية (Ctrl+Shift+S)' : 'Open sidebar (Ctrl+Shift+S)'}
          >
            <PanelLeft size={19} />
          </button>
        )}

        {/* ChatGPT Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-semibold text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
          >
            <span>ChatGPT</span>
            <span className="text-xs text-[#8e8e8e] font-normal">{currentModel?.name}</span>
            <ChevronDown size={14} className="text-[#8e8e8e] transition-transform duration-200" />
          </button>

          {/* Model Dropdown Menu */}
          {modelDropdownOpen && (
            <div
              className="absolute start-0 top-full mt-2 w-80 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700/80 rounded-2xl shadow-2xl p-2 z-50 text-start"
            >
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#8e8e8e] tracking-wide uppercase">
                {isRtl ? 'اختر النموذج' : 'Model Selection'}
              </div>

              <div className="space-y-1 mt-1">
                {models.map((model) => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-colors text-start ${
                        isSelected
                          ? 'bg-[#ececec] dark:bg-[#2f2f2f]'
                          : 'hover:bg-neutral-100 dark:hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-neutral-200 dark:bg-[#1a1a1a] mt-0.5 shrink-0">
                        {getModelIcon(model.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                            {model.name}
                          </span>
                          {isSelected && <Check size={15} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-[#5d5d5d] dark:text-[#b4b4b4] mt-0.5 line-clamp-2">
                          {model.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />

              {/* Temporary Chat Toggle */}
              <button
                onClick={() => {
                  onToggleTemporary();
                  setModelDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  isTemporary
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] text-[#5d5d5d] dark:text-[#b4b4b4]'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Ghost size={16} />
                  <div>
                    <div className="font-semibold">{isRtl ? 'محادثة مؤقتة' : 'Temporary chat'}</div>
                    <div className="text-[11px] opacity-75">
                      {isRtl ? 'لن يتم حفظها في السجل' : 'Not saved in chat history'}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    isTemporary ? 'bg-amber-500' : 'bg-neutral-400 dark:bg-neutral-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                      isTemporary ? (isRtl ? 'left-0.5' : 'right-0.5') : isRtl ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Temporary Chat Active Pill */}
        {isTemporary && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
            <Ghost size={13} />
            <span>{isRtl ? 'محادثة مؤقتة' : 'Temporary'}</span>
          </div>
        )}
      </div>

      {/* Right zone: Voice Mode + Language + Share Button */}
      <div className="flex items-center gap-1.5">
        {/* Voice Mode Button */}
        <button
          onClick={onOpenVoiceMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#2f2f2f] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
          title={isRtl ? 'بدء محادثة صوتية' : 'Start voice mode'}
        >
          <Headphones size={15} />
          <span className="hidden sm:inline">{isRtl ? 'الصوت' : 'Voice'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => onUpdateSettings({ language: isRtl ? 'en' : 'ar' })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#2f2f2f] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
          title={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Globe size={15} />
          <span>{isRtl ? 'English' : 'عربي'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#ececec] dark:bg-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">{isRtl ? 'مشاركة' : 'Share'}</span>
        </button>
      </div>
    </header>
  );
};

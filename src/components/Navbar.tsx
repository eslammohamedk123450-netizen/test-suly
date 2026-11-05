import React from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  Brain,
  FolderGit2,
  FileDown,
  Code2,
  Download,
  Menu,
} from 'lucide-react';
import { soundController } from '../utils/audio';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenVoice: () => void;
  onOpenMemory: () => void;
  onOpenProjects: () => void;
  onOpenExport: () => void;
  onToggleCanvas: () => void;
  isCanvasOpen: boolean;
  activeMemoriesCount: number;
  activeProjectName: string;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  installPrompt: (() => void) | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenVoice,
  onOpenMemory,
  onOpenProjects,
  onOpenExport,
  onToggleCanvas,
  isCanvasOpen,
  activeMemoriesCount,
  activeProjectName,
  isSoundEnabled,
  onToggleSound,
  installPrompt,
}) => {
  return (
    <header className="h-16 border-b border-[#1f2430] bg-[#07080a]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-stone-400 hover:text-[#d4af37] hover:bg-[#13161f] transition-colors md:hidden"
          title="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Emblem */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1c23] to-[#07080a] border border-[#d4af37]/40 flex items-center justify-center shadow-lg shadow-[#d4af37]/10 group">
            <span className="text-[#f3e5ab] font-extrabold text-sm tracking-widest font-mono">
              SU
            </span>
            <div className="absolute inset-0 rounded-xl bg-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">
                SULY <span className="text-gold-gradient">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                جيميني 3.8 فلاش
              </span>
            </div>
            <span className="text-[10px] text-stone-400 hidden sm:inline">
              منصة الذكاء الاصطناعي الموثوقة فائقة الفخامة
            </span>
          </div>
        </div>
      </div>

      {/* Center/Active Project Badge */}
      <div className="hidden lg:flex items-center gap-2 bg-[#0d0f14] border border-[#1f2430] px-3 py-1 rounded-full text-xs">
        <FolderGit2 className="w-3.5 h-3.5 text-[#d4af37]" />
        <span className="text-stone-400">المشروع النشط:</span>
        <button
          onClick={onOpenProjects}
          className="text-stone-200 hover:text-[#f3e5ab] font-medium transition-colors max-w-[180px] truncate"
          title="إدارة المشروع وقاعدة المعرفة"
        >
          {activeProjectName}
        </button>
      </div>

      {/* Right controls: Sound, Voice, Memory, Projects, Export, Canvas, PWA */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* PWA Install Button (if available) */}
        {installPrompt && (
          <button
            onClick={installPrompt}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#13161f] border border-[#d4af37]/40 text-[#f3e5ab] text-xs hover:bg-[#d4af37]/20 transition-all shadow-sm"
            title="تثبيت التطبيق على جهازك (PWA)"
          >
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>تثبيت PWA</span>
          </button>
        )}

        {/* Sound toggle button */}
        <button
          onClick={() => {
            soundController.playClick();
            onToggleSound();
          }}
          className={`p-2 rounded-lg border text-xs transition-all ${
            isSoundEnabled
              ? 'border-[#1f2430] bg-[#0d0f14] text-[#d4af37] hover:border-[#d4af37]/40'
              : 'border-[#1f2430] bg-[#0d0f14] text-stone-500 hover:text-stone-300'
          }`}
          title={isSoundEnabled ? 'المؤثرات الصوتية مفعلة' : 'المؤثرات الصوتية مكتومة'}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Smart Memory button */}
        <button
          onClick={onOpenMemory}
          className="relative p-2 rounded-lg border border-[#1f2430] bg-[#0d0f14] text-stone-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all text-xs"
          title="الذاكرة التراكمية الذكية (Smart Memory)"
        >
          <Brain className="w-4 h-4" />
          {activeMemoriesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-[#07080a] text-[9px] font-extrabold flex items-center justify-center">
              {activeMemoriesCount}
            </span>
          )}
        </button>

        {/* Projects / Knowledge Base button */}
        <button
          onClick={onOpenProjects}
          className="p-2 rounded-lg border border-[#1f2430] bg-[#0d0f14] text-stone-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all text-xs"
          title="قاعدة المعرفة والمشاريع"
        >
          <FolderGit2 className="w-4 h-4" />
        </button>

        {/* Export Center button */}
        <button
          onClick={onOpenExport}
          className="p-2 rounded-lg border border-[#1f2430] bg-[#0d0f14] text-stone-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all text-xs"
          title="مركز التصدير (PDF / Word / Markdown)"
        >
          <FileDown className="w-4 h-4" />
        </button>

        {/* Interactive Canvas Toggle */}
        <button
          onClick={onToggleCanvas}
          className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
            isCanvasOpen
              ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f3e5ab] shadow-sm shadow-[#d4af37]/20'
              : 'border-[#1f2430] bg-[#0d0f14] text-stone-300 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
          }`}
          title="لوحة العمل التفاعلية (Canvas & Code Runner)"
        >
          <Code2 className="w-4 h-4 text-[#d4af37]" />
          <span className="hidden sm:inline">اللوحة (Canvas)</span>
        </button>

        {/* Advanced Voice Mode button */}
        <button
          onClick={onOpenVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#07080a] font-bold text-xs hover:brightness-110 shadow-md shadow-[#d4af37]/20 active:scale-95 transition-all"
          title="تشغيل الوضع الصوتي المتقدم"
        >
          <Mic className="w-4 h-4 animate-pulse text-[#07080a]" />
          <span className="hidden sm:inline font-bold">الوضع الصوتي</span>
        </button>
      </div>
    </header>
  );
};

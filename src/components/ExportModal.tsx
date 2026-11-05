import React, { useRef } from 'react';
import {
  X,
  FileDown,
  FileType,
  FileText,
  FileJson,
  Upload,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Conversation } from '../types';
import {
  exportToPDF,
  exportToWord,
  exportToMarkdown,
  exportToJSON,
} from '../utils/exporter';
import { soundController } from '../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onRestoreBackup?: (importedConvs: Conversation[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onRestoreBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportPDF = () => {
    soundController.playComplete();
    exportToPDF(conversation);
    onClose();
  };

  const handleExportWord = () => {
    soundController.playComplete();
    exportToWord(conversation);
    onClose();
  };

  const handleExportMD = () => {
    soundController.playComplete();
    exportToMarkdown(conversation);
    onClose();
  };

  const handleExportJSON = () => {
    soundController.playComplete();
    exportToJSON(conversation, `SULY_Backup_${conversation.id.slice(0, 8)}.json`);
    onClose();
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          if (Array.isArray(parsed)) {
            onRestoreBackup(parsed);
          } else if (parsed && parsed.messages) {
            onRestoreBackup([parsed]);
          }
          soundController.playComplete();
          alert('تم استعادة المحادثات بنجاح من النسخة الاحتياطية.');
          onClose();
        }
      } catch {
        alert('الملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0d0f14] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#13161f] border-b border-[#1f2430] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center">
              <FileDown className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">مركز التصدير والتقارير التنفيذية</h2>
              <p className="text-[11px] text-stone-400">
                صدّر محادثتك أو تقريرك بتنسيق فاخر معتمد يحمل هوية SULY AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1a1f2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* PDF Card */}
          <button
            onClick={handleExportPDF}
            className="p-4 rounded-xl bg-[#10131b] border border-[#1f2430] hover:border-[#d4af37] text-right flex flex-col gap-2 group transition-all hover:bg-[#141824]"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileType className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-[#f3e5ab] transition-colors">
                تقرير PDF احترافي
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                تنسيق معتمد برأسية ذهبية وشعار رسمي جاهز للطباعة والتوثيق
              </div>
            </div>
          </button>

          {/* Word Card */}
          <button
            onClick={handleExportWord}
            className="p-4 rounded-xl bg-[#10131b] border border-[#1f2430] hover:border-[#d4af37] text-right flex flex-col gap-2 group transition-all hover:bg-[#141824]"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-[#f3e5ab] transition-colors">
                مستند Word (.doc)
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                قابل للتعديل عبر Microsoft Word وGoogle Docs
              </div>
            </div>
          </button>

          {/* Markdown Card */}
          <button
            onClick={handleExportMD}
            className="p-4 rounded-xl bg-[#10131b] border border-[#1f2430] hover:border-[#d4af37] text-right flex flex-col gap-2 group transition-all hover:bg-[#141824]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-[#f3e5ab] transition-colors">
                ملف Markdown (.md)
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                ملائم للمطورين وتوثيق مشاريع GitHub والمدونات
              </div>
            </div>
          </button>

          {/* JSON Backup Card */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl bg-[#10131b] border border-[#1f2430] hover:border-[#d4af37] text-right flex flex-col gap-2 group transition-all hover:bg-[#141824]"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-[#f3e5ab] transition-colors">
                نسخة احتياطية JSON
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                حفظ بيانات الجلسة بالكامل لنقلها أو استعادتها لاحقاً
              </div>
            </div>
          </button>
        </div>

        {/* Restore section */}
        {onRestoreBackup && (
          <div className="px-6 py-4 bg-[#0a0c10] border-t border-[#181c25] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Upload className="w-4 h-4 text-stone-500" />
              <span>استعادة محادثة من ملف JSON:</span>
            </div>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#181c25] hover:bg-[#232938] text-xs text-[#f3e5ab] border border-[#262c3d] transition-colors">
              <span>اختر ملف النسخة الاحتياطية</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

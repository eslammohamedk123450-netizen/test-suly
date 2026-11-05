import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  FileDown,
  Printer,
  FileText,
  FileCode,
} from 'lucide-react';
import { Conversation } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  isRtl?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversation,
  isRtl = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const shareUrl = `${window.location.origin}/chat/${conversation.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    let md = `# ${conversation.title}\n\n*Exported from SULY on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    conversation.messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? '👤 User' : '🤖 SULY';
      md += `### ${roleName}\n\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[\/\\?%*:|"<>]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Export as Plain Text
  const handleExportText = () => {
    let txt = `${conversation.title}\n\n`;
    conversation.messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? 'User' : 'SULY';
      txt += `[${roleName}]:\n${msg.content}\n\n----------------------------\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[\/\\?%*:|"<>]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Export / Print as PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-[#0d0d0d] dark:text-[#ececec]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-emerald-500" />
            <h3 className="text-base font-semibold">
              {isRtl ? 'مشاركة وتصدير المحادثة' : 'Share & Export Conversation'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
            <div className="text-xs font-semibold truncate mb-1">{conversation.title}</div>
            <div className="text-[11px] text-[#8e8e8e]">
              {conversation.messages.length} {isRtl ? 'رسالة في هذه المحادثة' : 'messages in this conversation'}
            </div>
          </div>

          {/* Quick Export Formats */}
          <div>
            <div className="text-xs font-semibold mb-2">
              {isRtl ? 'خيارات التصدير المباشر:' : 'Direct Export Options:'}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePrintPdf}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-center"
              >
                <Printer size={18} className="text-emerald-500" />
                <span className="text-xs font-medium">{isRtl ? 'طباعة / PDF' : 'PDF / Print'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-center"
              >
                <FileCode size={18} className="text-blue-500" />
                <span className="text-xs font-medium">Markdown (.md)</span>
              </button>

              <button
                onClick={handleExportText}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-center"
              >
                <FileText size={18} className="text-amber-500" />
                <span className="text-xs font-medium">{isRtl ? 'نص عادي (.txt)' : 'Text (.txt)'}</span>
              </button>
            </div>
          </div>

          {/* Public Link Box */}
          <div>
            <div className="text-xs font-semibold mb-1.5">
              {isRtl ? 'رابط المشاركة العام:' : 'Public Share Link:'}
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/10 text-xs">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent truncate focus:outline-none text-inherit text-start font-mono"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold shrink-0 hover:opacity-90 transition-opacity"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span>{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>{isRtl ? 'نسخ الرابط' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

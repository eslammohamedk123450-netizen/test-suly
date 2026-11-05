import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Table as TableIcon,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Database,
  BarChart3,
} from 'lucide-react';
import { Attachment } from '../types';

interface FileInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: Attachment | null;
  onAskAboutFile: (prompt: string, attachment: Attachment) => void;
  isRtl?: boolean;
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({
  isOpen,
  onClose,
  attachment,
  onAskAboutFile,
  isRtl = false,
}) => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !attachment) return null;

  const isCsv = attachment.name.endsWith('.csv') || attachment.mimeType === 'text/csv';
  const isJson = attachment.name.endsWith('.json') || attachment.mimeType === 'application/json';

  // Parse CSV rows if applicable
  const csvData = useMemo(() => {
    if (!isCsv || !attachment.textContent) return null;
    const lines = attachment.textContent.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return null;

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')));

    return { headers, rows };
  }, [isCsv, attachment.textContent]);

  const filteredCsvRows = useMemo(() => {
    if (!csvData) return [];
    if (!search.trim()) return csvData.rows;
    const q = search.toLowerCase();
    return csvData.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
  }, [csvData, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(attachment.textContent || attachment.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    onAskAboutFile(prompt, attachment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#0d0d0d] dark:text-[#ececec]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              {isCsv ? <TableIcon size={16} /> : <FileText size={16} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">{attachment.name}</h3>
              <p className="text-[11px] text-[#8e8e8e]">
                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'ملف نصي'} · {attachment.mimeType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8e8e8e] hover:text-inherit hover:bg-neutral-200 dark:hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span className="text-emerald-500">{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{isRtl ? 'نسخ النص' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8e8e8e] hover:text-inherit hover:bg-neutral-200 dark:hover:bg-white/5 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-100 dark:bg-[#171717]">
          {isCsv && csvData ? (
            <div className="space-y-3">
              {/* Search within CSV */}
              <div className="relative max-w-xs">
                <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8e8e8e]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRtl ? 'البحث داخل الجدول...' : 'Search within table...'}
                  className="w-full ps-8 pe-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#252525] border border-neutral-300 dark:border-white/10 focus:outline-none"
                />
              </div>

              {/* Table rendering */}
              <div className="rounded-xl border border-neutral-300 dark:border-white/10 overflow-x-auto bg-white dark:bg-[#1e1e1e] shadow-xs">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#282828] border-b border-neutral-300 dark:border-white/10 text-[#8e8e8e]">
                      <th className="p-2 text-start font-mono text-[10px] w-10">#</th>
                      {csvData.headers.map((h, i) => (
                        <th key={i} className="p-2 text-start font-semibold text-inherit whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCsvRows.slice(0, 50).map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="border-b border-neutral-200 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="p-2 text-start font-mono text-[10px] text-[#8e8e8e]">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 text-start whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-[#8e8e8e]">
                {isRtl
                  ? `عرض ${Math.min(filteredCsvRows.length, 50)} من إجمالي ${csvData.rows.length} صفاً.`
                  : `Showing ${Math.min(filteredCsvRows.length, 50)} of ${csvData.rows.length} rows.`}
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-white dark:bg-[#1e1e1e] border border-neutral-300 dark:border-white/10 font-mono text-xs leading-relaxed overflow-auto text-inherit max-h-[50vh]">
              <code>{attachment.textContent || 'محتوى الملف الثنائي تم تحليله وجاهز للاستفسارات.'}</code>
            </pre>
          )}
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="p-4 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1f1f1f]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8e8e8e] mb-2">
            <Sparkles size={13} className="text-emerald-500" />
            <span>{isRtl ? 'استفسارات سريعة حول هذا الملف:' : 'Quick queries for this file:'}</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleQuickPrompt(isRtl ? 'لخص لي هذا الملف واستخرج أهم 3 استنتاجات رئيسية.' : 'Summarize this file and extract key conclusions.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-2xs text-start"
            >
              <span>{isRtl ? 'تلخيص شامل واستنتاجات' : 'Summarize file'}</span>
              <ArrowRight size={12} className={isRtl ? 'rotate-180' : ''} />
            </button>

            {isCsv && (
              <button
                onClick={() => handleQuickPrompt(isRtl ? 'حلل بيانات هذا الجدول واستخرج الإحصائيات (المتوسطات والنسب) واقترح رسماً بيانياً مناسباً.' : 'Analyze this dataset, calculate averages, and suggest chart.')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-2xs text-start"
              >
                <BarChart3 size={13} className="text-emerald-500" />
                <span>{isRtl ? 'تحليل إحصائي ورسم بياني' : 'Statistical Analysis'}</span>
              </button>
            )}

            <button
              onClick={() => handleQuickPrompt(isRtl ? 'افحص محتوى هذا الملف وابحث عن أي تناقضات أو أخطاء.' : 'Check for errors or anomalies in this file.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-2xs text-start"
            >
              <span>{isRtl ? 'فحص الأخطاء والتناقضات' : 'Inspect anomalies'}</span>
              <ArrowRight size={12} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

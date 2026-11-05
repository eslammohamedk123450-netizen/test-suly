import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Bug,
  MessageSquareQuote,
  Maximize2,
  Minimize2,
  FileText,
  Code,
  ArrowRight,
  Sliders,
  Download,
} from 'lucide-react';
import { CanvasState } from '../types';

interface CanvasPanelProps {
  canvas: CanvasState;
  onUpdateCanvas: (updated: Partial<CanvasState>) => void;
  onClose: () => void;
  onAskCanvas: (prompt: string) => void;
  isRtl?: boolean;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  canvas,
  onUpdateCanvas,
  onClose,
  onAskCanvas,
  isRtl = false,
}) => {
  const [content, setContent] = useState(canvas.content);
  const [title, setTitle] = useState(canvas.title);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  useEffect(() => {
    setContent(canvas.content);
    setTitle(canvas.title);
  }, [canvas.content, canvas.title]);

  if (!canvas.isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    onUpdateCanvas({ content: val });
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    onUpdateCanvas({ title: val });
  };

  // Quick Canvas Action Handlers
  const handleQuickAction = (action: string) => {
    setActiveTool(action);
    switch (action) {
      case 'fix-bugs':
        onAskCanvas(`راجع هذا الكود في Canvas واصلح أي أخطاء وثغرات برمجية مع شرح التحسينات:\n\n\`\`\`${canvas.language}\n${content}\n\`\`\``);
        break;
      case 'add-comments':
        onAskCanvas(`أضف تعليقات توضيحية احترافية وشاملة (Docstrings and Comments) لكل أجزاء هذا الكود:\n\n\`\`\`${canvas.language}\n${content}\n\`\`\``);
        break;
      case 'polish':
        onAskCanvas(`قم بتحسين صياغة وبلاغة هذا المستند وجعله أكثر إيجازاً وقوة وتأثيراً:\n\n${content}`);
        break;
      case 'shorten':
        onAskCanvas(`اختصر هذا النص في Canvas ليكون أكثر تركيزاً مع الاحتفاظ بكافة النقاط الجوهرية:\n\n${content}`);
        break;
      case 'lengthen':
        onAskCanvas(`توسع في هذا النص وقدم أمثلة وشروحات عملية إضافية تعزز الفكرة:\n\n${content}`);
        break;
    }
  };

  const lines = content.split('\n');

  return (
    <div
      className={`h-full border-s border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] flex flex-col z-30 transition-all duration-300 shadow-xl ${
        isExpanded ? 'w-full md:w-[70vw]' : 'w-full md:w-[500px] lg:w-[600px]'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#212121]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            {canvas.type === 'code' ? <Code size={14} /> : <FileText size={14} />}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xs font-semibold bg-transparent focus:outline-none border-b border-transparent focus:border-emerald-500 px-1 truncate flex-1 text-inherit"
          />
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-white/10 text-[#8e8e8e]">
            {canvas.language}
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1 shrink-0 ps-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#8e8e8e] hover:text-inherit hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors hidden sm:block"
            title={isExpanded ? 'تصغير' : 'تكبير الشاشة'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-[#8e8e8e] hover:text-inherit hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            title={isRtl ? 'نسخ المحتوى' : 'Copy'}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8e8e] hover:text-inherit hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            title={isRtl ? 'إغلاق Canvas' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Editor Content Area with Line Numbers */}
      <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#171717] font-mono text-xs text-[#0d0d0d] dark:text-[#ececec]">
        {/* Line Numbers */}
        <div className="w-10 py-3 pe-2 text-end select-none text-[#8e8e8e]/50 border-e border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-black/10 overflow-hidden shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-6 text-[11px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editable Canvas Textarea */}
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent resize-none focus:outline-none font-mono text-xs leading-6 overflow-auto text-inherit selection:bg-emerald-500/20"
          placeholder={isRtl ? 'اكتب أو عدل المحتوى هنا...' : 'Write or edit content in Canvas...'}
        />
      </div>

      {/* Canvas Bottom Action Floating Pills */}
      <div className="p-3 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#212121]">
        <div className="flex items-center justify-between text-[11px] text-[#8e8e8e] mb-2 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-emerald-500" />
            <span className="font-semibold text-inherit">{isRtl ? 'إجراءات ذكاء Canvas السريعة' : 'Canvas AI Quick Actions'}</span>
          </div>
          <span>
            {lines.length} {isRtl ? 'سطر' : 'lines'} · {content.split(/\s+/).filter(Boolean).length} {isRtl ? 'كلمة' : 'words'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto text-xs">
          {canvas.type === 'code' ? (
            <>
              <button
                onClick={() => handleQuickAction('fix-bugs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 text-xs transition-colors shadow-2xs"
              >
                <Bug size={13} className="text-red-400" />
                <span>{isRtl ? 'فحص وإصلاح الأخطاء' : 'Fix bugs'}</span>
              </button>

              <button
                onClick={() => handleQuickAction('add-comments')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 text-xs transition-colors shadow-2xs"
              >
                <MessageSquareQuote size={13} className="text-blue-400" />
                <span>{isRtl ? 'إضافة شروحات وتعليقات' : 'Add comments'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleQuickAction('polish')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 text-xs transition-colors shadow-2xs"
              >
                <Sparkles size={13} className="text-emerald-500" />
                <span>{isRtl ? 'تحسين الصياغة' : 'Polish text'}</span>
              </button>

              <button
                onClick={() => handleQuickAction('shorten')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 text-xs transition-colors shadow-2xs"
              >
                <span>{isRtl ? 'تقصير وإيجاز' : 'Make shorter'}</span>
              </button>

              <button
                onClick={() => handleQuickAction('lengthen')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-500 text-xs transition-colors shadow-2xs"
              >
                <span>{isRtl ? 'توسيع وتفصيل' : 'Make longer'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

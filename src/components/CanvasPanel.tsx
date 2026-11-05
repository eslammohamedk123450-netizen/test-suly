import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Copy,
  Check,
  Eye,
  Code2,
  Terminal,
  History,
  Sparkles,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
} from 'lucide-react';
import { runJavaScript, runPython } from '../utils/codeRunner';
import { soundController } from '../utils/audio';
import { ExecutionResult } from '../types';

interface CanvasPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
  onAskSulyToRefine?: (prompt: string, code: string) => void;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  initialLanguage = 'javascript',
  onAskSulyToRefine,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'terminal' | 'history'>('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [versions, setVersions] = useState<Array<{ id: number; timestamp: number; code: string }>>([]);
  const [refinePrompt, setRefinePrompt] = useState('');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setLanguage(initialLanguage);
      setVersions((prev) => [
        { id: Date.now(), timestamp: Date.now(), code: initialCode },
        ...prev.slice(0, 9),
      ]);
    }
  }, [initialCode, initialLanguage]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      soundController.playClick();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRun = async () => {
    soundController.playCodeRun();
    setIsRunning(true);
    setActiveTab('terminal');

    try {
      let res: ExecutionResult;
      const lang = language.toLowerCase();
      if (lang === 'python' || lang === 'py') {
        res = await runPython(code);
      } else {
        res = await runJavaScript(code);
      }
      setExecutionResult(res);
      if (res.status === 'success') {
        soundController.playComplete();
      }
    } catch (err: unknown) {
      setExecutionResult({
        output: '',
        error: String(err),
        executionTimeMs: 0,
        status: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveVersion = () => {
    setVersions((prev) => [
      { id: Date.now(), timestamp: Date.now(), code },
      ...prev.slice(0, 9),
    ]);
    soundController.playClick();
  };

  const isHtml = language.toLowerCase() === 'html' || language.toLowerCase() === 'svg';

  return (
    <aside
      className={`fixed top-16 bottom-0 z-30 bg-[#0a0c10] border-r border-[#1f2430] flex flex-col transition-all duration-300 shadow-2xl ${
        isFullscreen
          ? 'left-0 right-0 w-full'
          : 'left-0 w-full sm:w-[480px] md:w-[560px] lg:w-[620px]'
      }`}
    >
      {/* Canvas Top Bar */}
      <div className="h-12 px-4 bg-[#0d0f14] border-b border-[#1f2430] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
          <span className="font-bold text-xs text-white tracking-wide">
            لوحة العمل التفاعلية (Canvas)
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#13161f] text-[#f3e5ab] text-xs rounded border border-[#232938] px-2 py-0.5 font-mono focus:outline-none focus:border-[#d4af37]"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML / Web</option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-[#181c25] text-stone-400 hover:text-white transition-colors"
            title={isFullscreen ? 'تصغير' : 'تكبير ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#181c25] text-stone-400 hover:text-rose-400 transition-colors"
            title="إغلاق اللوحة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs and Actions bar */}
      <div className="px-4 py-2 bg-[#08090d] border-b border-[#181c25] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'editor'
                ? 'bg-[#181c26] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>المحرر</span>
          </button>

          {isHtml && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#181c26] text-[#f3e5ab] border border-[#d4af37]/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>المعاينة الحية</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'terminal'
                ? 'bg-[#181c26] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>المخرجات</span>
            {executionResult && (
              <span
                className={`w-2 h-2 rounded-full ${
                  executionResult.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'history'
                ? 'bg-[#181c26] text-[#f3e5ab] border border-[#d4af37]/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل الإصدارات ({versions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#d4af37] text-[#07080a] font-bold text-xs hover:brightness-110 transition-all shadow-sm shadow-[#d4af37]/20"
            title="تشغيل الكود الآن"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>تشغيل (Run)</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-[#181c25] text-stone-300"
            title="نسخ المحتوى"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col bg-[#07080a]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="اكتب كودك هنا أو سيقوم SULY AI بتوليده وتحديثه..."
              className="w-full flex-1 p-4 bg-transparent text-stone-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none border-none selection:bg-[#d4af37]/20"
              dir="ltr"
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 bg-white overflow-auto p-4">
            <iframe
              title="SULY Canvas Preview"
              srcDoc={code}
              sandbox="allow-scripts"
              className="w-full h-full border-none rounded"
            />
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="flex-1 bg-[#050608] p-4 font-mono text-xs overflow-y-auto" dir="ltr">
            {isRunning ? (
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تنفيذ الكود بأمان في المتصفح...</span>
              </div>
            ) : executionResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#181c25] text-stone-400">
                  <span className="text-[#f3e5ab]">
                    الحالة: {executionResult.status === 'success' ? '✓ تم بنجاح' : '✗ حدث خطأ'}
                  </span>
                  <span>الوقت المستغرق: ⚡ {executionResult.executionTimeMs}ms</span>
                </div>
                {executionResult.output && (
                  <pre className="text-stone-200 whitespace-pre-wrap leading-relaxed">
                    {executionResult.output}
                  </pre>
                )}
                {executionResult.error && (
                  <pre className="text-rose-400 whitespace-pre-wrap bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                    {executionResult.error}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-stone-500 italic">
                انقر على زر "تشغيل (Run)" أعلاه لتشغيل الكود ورؤية المخرجات هنا مباشرة.
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 p-4 bg-[#07080a] overflow-y-auto space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
              <span className="text-stone-300 font-bold">تاريخ الإصدارات واللقطات</span>
              <button
                onClick={saveVersion}
                className="px-2.5 py-1 rounded bg-[#181c26] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/10"
              >
                + حفظ إصدار حالي
              </button>
            </div>
            {versions.map((v, i) => (
              <div
                key={v.id}
                className="p-3 rounded-lg bg-[#0d0f14] border border-[#1f2430] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">إصدار #{versions.length - i}</div>
                  <div className="text-stone-500 text-[10px]">
                    {new Date(v.timestamp).toLocaleTimeString('ar-EG')} • {v.code.length} حرف
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCode(v.code);
                    setActiveTab('editor');
                    soundController.playClick();
                  }}
                  className="px-2 py-1 rounded bg-[#13161f] text-stone-300 hover:text-[#d4af37] border border-[#222736]"
                >
                  استعادة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Refine Footer */}
      {onAskSulyToRefine && (
        <div className="p-3 bg-[#0d0f14] border-t border-[#1f2430] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
          <input
            type="text"
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            placeholder="اطلب من SULY AI تحسين هذا الكود أو الوثيقة..."
            className="flex-1 bg-[#13161f] border border-[#1f2430] rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && refinePrompt.trim()) {
                onAskSulyToRefine(refinePrompt, code);
                setRefinePrompt('');
              }
            }}
          />
          <button
            onClick={() => {
              if (refinePrompt.trim()) {
                onAskSulyToRefine(refinePrompt, code);
                setRefinePrompt('');
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold hover:bg-[#d4af37]/30 transition-colors"
          >
            تعديل بالذكاء الاصطناعي
          </button>
        </div>
      )}
    </aside>
  );
};

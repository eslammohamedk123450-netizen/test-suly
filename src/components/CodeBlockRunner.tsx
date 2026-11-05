import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { runJavaScript, runPython } from '../utils/codeRunner';
import { soundController } from '../utils/audio';
import { ExecutionResult } from '../types';

interface CodeBlockRunnerProps {
  language: string;
  code: string;
  onOpenInCanvas?: (code: string, language: string) => void;
}

export const CodeBlockRunner: React.FC<CodeBlockRunnerProps> = ({
  language,
  code,
  onOpenInCanvas,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const normalizedLang = language.toLowerCase().trim();
  const isExecutable =
    normalizedLang === 'javascript' ||
    normalizedLang === 'js' ||
    normalizedLang === 'typescript' ||
    normalizedLang === 'ts' ||
    normalizedLang === 'python' ||
    normalizedLang === 'py';

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
    setIsConsoleOpen(true);

    try {
      let res: ExecutionResult;
      if (normalizedLang === 'python' || normalizedLang === 'py') {
        res = await runPython(code);
      } else {
        res = await runJavaScript(code);
      }
      setResult(res);
      if (res.status === 'success') {
        soundController.playComplete();
      }
    } catch (err: unknown) {
      setResult({
        output: '',
        error: err instanceof Error ? err.message : String(err),
        executionTimeMs: 0,
        status: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-4 rounded-xl border border-[#1f2430] bg-[#0d0f14] overflow-hidden shadow-lg shadow-black/40">
      {/* Code Header Bar */}
      <div className="px-3.5 py-2 bg-[#13161f] border-b border-[#1f2430] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]/80" />
          <span className="font-mono font-medium text-stone-300 uppercase tracking-wider">
            {language || 'code'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Run Button if executable */}
          {isExecutable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#f3e5ab] border border-[#d4af37]/30 transition-all font-sans font-medium text-[11px]"
              title="تشغيل الكود مباشرة في المتصفح"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#d4af37]" />
                  <span>جاري التشغيل...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-[#d4af37]" />
                  <span>تشغيل حي (Run)</span>
                </>
              )}
            </button>
          )}

          {/* Open in Canvas */}
          {onOpenInCanvas && (
            <button
              onClick={() => onOpenInCanvas(code, language)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#1f2430] text-stone-300 hover:text-[#d4af37] transition-colors text-[11px]"
              title="فتح وتعديل الكود في لوحة العمل التفاعلية"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">في اللوحة</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#1f2430] text-stone-300 hover:text-stone-100 transition-colors text-[11px]"
            title="نسخ الكود"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>نسخ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <pre className="p-4 text-xs sm:text-sm font-mono text-stone-200 overflow-x-auto leading-relaxed bg-[#0a0c10] select-text" dir="ltr">
        <code>{code}</code>
      </pre>

      {/* Interactive Execution Console */}
      {isConsoleOpen && result && (
        <div className="border-t border-[#1f2430] bg-[#07080a] p-3 text-xs" dir="ltr">
          <div className="flex items-center justify-between pb-2 border-b border-[#181c25] text-stone-400 text-[11px]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="font-mono text-stone-300">Terminal Output</span>
              {result.status === 'success' ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  ✓ Success
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                  ✗ Error
                </span>
              )}
              <span className="text-stone-500 font-mono">⚡ {result.executionTimeMs}ms</span>
            </div>

            <div className="flex items-center gap-2" dir="rtl">
              <button
                onClick={handleRun}
                className="hover:text-[#d4af37] transition-colors p-1"
                title="إعادة التشغيل"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="hover:text-stone-200 text-stone-500"
              >
                إغلاق
              </button>
            </div>
          </div>

          <div className="mt-2 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {result.output && (
              <div className="text-stone-300">{result.output}</div>
            )}
            {result.error && (
              <div className="text-rose-400 mt-1">{result.error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

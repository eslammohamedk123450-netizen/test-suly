import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCw,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Code,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  isRtl?: boolean;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  isRtl = false,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceWidth, setDeviceWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare safe sandboxed HTML content
  const prepareHtml = () => {
    const isSvg = language === 'svg' || code.trim().startsWith('<svg');
    if (isSvg) {
      return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; font-family: system-ui, sans-serif; }
      svg { max-width: 90vw; max-height: 90vh; }
    </style>
  </head>
  <body>
    ${code}
  </body>
</html>`;
    }

    // If code already contains <!DOCTYPE html> or <html>
    if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      return code;
    }

    // Default wrapping for HTML/CSS/JS snippets
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
      }
      @media (prefers-color-scheme: dark) {
        body { color: #f8fafc; background: #0f172a; }
      }
    </style>
  </head>
  <body>
    ${code}
  </body>
</html>`;
  };

  const getContainerWidth = () => {
    switch (deviceWidth) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-5xl h-[88vh] bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#0d0d0d] dark:text-[#ececec]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#252525]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Play size={13} fill="currentColor" />
            </div>
            <span className="text-xs font-semibold">
              {isRtl ? 'معاينة الكود التفاعلي (Interactive Preview)' : 'Interactive Code Preview'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-200 dark:bg-white/10 uppercase">
              {language}
            </span>
          </div>

          {/* Central Controls: View Switcher & Device Width */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-200 dark:bg-[#171717] text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-[#2f2f2f] text-emerald-500 font-medium shadow-xs'
                    : 'text-[#8e8e8e] hover:text-inherit'
                }`}
              >
                <Eye size={13} />
                <span>{isRtl ? 'معاينة' : 'Preview'}</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'code'
                    ? 'bg-white dark:bg-[#2f2f2f] text-emerald-500 font-medium shadow-xs'
                    : 'text-[#8e8e8e] hover:text-inherit'
                }`}
              >
                <Code size={13} />
                <span>{isRtl ? 'الكود' : 'Code'}</span>
              </button>
            </div>

            {/* Responsive Viewport Buttons (in Preview Mode) */}
            {viewMode === 'preview' && (
              <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-neutral-200 dark:bg-[#171717] text-[#8e8e8e]">
                <button
                  onClick={() => setDeviceWidth('desktop')}
                  className={`p-1.5 rounded-md ${deviceWidth === 'desktop' ? 'bg-white dark:bg-[#2f2f2f] text-inherit' : 'hover:text-inherit'}`}
                  title={isRtl ? 'حاسوب' : 'Desktop'}
                >
                  <Monitor size={14} />
                </button>
                <button
                  onClick={() => setDeviceWidth('tablet')}
                  className={`p-1.5 rounded-md ${deviceWidth === 'tablet' ? 'bg-white dark:bg-[#2f2f2f] text-inherit' : 'hover:text-inherit'}`}
                  title={isRtl ? 'جهاز لوحي' : 'Tablet'}
                >
                  <Tablet size={14} />
                </button>
                <button
                  onClick={() => setDeviceWidth('mobile')}
                  className={`p-1.5 rounded-md ${deviceWidth === 'mobile' ? 'bg-white dark:bg-[#2f2f2f] text-inherit' : 'hover:text-inherit'}`}
                  title={isRtl ? 'هاتف' : 'Mobile'}
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5">
            {viewMode === 'preview' && (
              <button
                onClick={() => setKey((k) => k + 1)}
                className="p-1.5 rounded-lg text-[#8e8e8e] hover:text-inherit hover:bg-neutral-200 dark:hover:bg-white/5 transition-colors"
                title={isRtl ? 'إعادة تحميل' : 'Reload'}
              >
                <RotateCw size={15} />
              </button>
            )}

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
                  <span>{isRtl ? 'نسخ' : 'Copy'}</span>
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

        {/* Modal Viewport Body */}
        <div className="flex-1 bg-neutral-100 dark:bg-[#141414] overflow-auto flex items-center justify-center p-2 sm:p-4">
          {viewMode === 'preview' ? (
            <div
              className={`h-full bg-white dark:bg-[#0f172a] rounded-xl shadow-lg border border-neutral-300 dark:border-white/10 overflow-hidden transition-all duration-300 ${getContainerWidth()}`}
            >
              <iframe
                key={key}
                title="Code Sandbox Preview"
                srcDoc={prepareHtml()}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <pre className="w-full h-full p-4 overflow-auto text-xs font-mono bg-[#1e1e1e] text-[#ececec] rounded-xl border border-white/10 leading-relaxed selection:bg-emerald-500/30">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

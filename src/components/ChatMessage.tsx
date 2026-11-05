import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Pencil,
  ChevronDown,
  ChevronRight,
  Brain,
  FileText,
  Play,
  Download,
  Maximize2,
  Sparkles,
  BarChart2,
  FileEdit,
} from 'lucide-react';
import { Message, Attachment } from '../types';
import { speakText, stopSpeaking } from '../utils/storage';
import { CodePreviewModal } from './CodePreviewModal';
import { DataChart } from './DataChart';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onInspectAttachment?: (att: Attachment) => void;
  onOpenInCanvas?: (content: string, lang: string) => void;
  isRtl?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  onRegenerate,
  onEdit,
  onInspectAttachment,
  onOpenInCanvas,
  isRtl = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [showThoughts, setShowThoughts] = useState(false);

  // Code preview state
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState('html');

  // Image lightbox state
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(message.content);
      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, Math.max(3000, message.content.length * 50));
      return () => clearTimeout(timer);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(editText.trim());
      setIsEditing(false);
    }
  };

  const handleDownloadImage = (url: string, filename = 'generated-image.jpg') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Heuristic to detect if response has simple numerical data to offer a chart
  const hasNumericalData = React.useMemo(() => {
    if (isUser || !message.content) return false;
    // Check if table contains numbers
    return /\|.*?\d+.*?\|/.test(message.content) && message.content.split('\n').length >= 4;
  }, [message.content, isUser]);

  // Sample data parsed from table if available
  const sampleChartData = React.useMemo(() => {
    if (!hasNumericalData) return null;
    const lines = message.content.split('\n').filter((l) => l.trim().startsWith('|'));
    if (lines.length < 3) return null;

    const data: Array<{ label: string; value: number }> = [];
    for (let i = 2; i < lines.length; i++) {
      const parts = lines[i].split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const numMatch = parts[1].match(/\d+(\.\d+)?/);
        if (numMatch) {
          data.push({
            label: parts[0].replace(/[*_`]/g, ''),
            value: parseFloat(numMatch[0]),
          });
        }
      }
    }
    return data.length >= 2 ? data : null;
  }, [hasNumericalData, message.content]);

  if (isUser) {
    return (
      <div className="flex justify-end my-5 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-[85%] md:max-w-[70%] group relative">
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onInspectAttachment && onInspectAttachment(att)}
                  className={`relative rounded-xl overflow-hidden border border-white/10 max-w-[200px] ${onInspectAttachment ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all' : ''}`}
                  title={onInspectAttachment ? (isRtl ? 'عرض وتحليل الملف' : 'Inspect file') : undefined}
                >
                  {att.type === 'image' ? (
                    <img src={att.data} alt={att.name} className="h-28 w-auto object-cover rounded-xl" />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 text-xs text-neutral-200">
                      <FileText size={16} />
                      <span className="truncate max-w-[120px]">{att.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-2xl p-3 shadow-lg border border-neutral-300 dark:border-neutral-600">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent resize-none focus:outline-none text-sm text-[#0d0d0d] dark:text-[#ececec] min-h-[60px]"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg text-xs text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  {isRtl ? 'حفظ وإرسال' : 'Save & Submit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-[#f4f4f4] dark:bg-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] rounded-3xl px-5 py-3 text-sm md:text-[15px] leading-relaxed shadow-xs whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Edit button */}
              {onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute -start-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] opacity-0 group-hover:opacity-100 transition-opacity"
                  title={isRtl ? 'تعديل السؤال' : 'Edit prompt'}
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <>
      <div className="flex gap-4 my-6 px-4 max-w-3xl mx-auto w-full group" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* SULY Studio Sparkle Icon */}
        <div className="w-7 h-7 rounded-full border border-neutral-300 dark:border-white/10 bg-white dark:bg-black flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-600 dark:text-emerald-400">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.8956zm16.5995 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4037-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.4074 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219zm1.145-2.0154l3.3005-1.8994 3.3005 1.8994v3.8035l-3.3005 1.9042-3.3005-1.9042z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Reasoning / Thinking Accordion */}
          {message.thoughts && (
            <div className="rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-100 dark:bg-white/5 overflow-hidden">
              <button
                onClick={() => setShowThoughts(!showThoughts)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-[#5d5d5d] dark:text-[#b4b4b4] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
              >
                <Brain size={14} className="text-purple-400" />
                <span>{isRtl ? 'تم التفكير لبضع ثوانٍ' : 'Thought for a few seconds'}</span>
                {showThoughts ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {showThoughts && (
                <div className="px-3 pb-3 pt-1 text-xs text-[#8e8e8e] leading-relaxed border-t border-neutral-200 dark:border-white/5 whitespace-pre-wrap font-mono">
                  {message.thoughts}
                </div>
              )}
            </div>
          )}

          {/* Generated Image Card if present */}
          {message.generatedImageUrl && (
            <div className="relative my-3 rounded-2xl overflow-hidden border border-neutral-300 dark:border-white/10 max-w-lg shadow-md group">
              <img
                src={message.generatedImageUrl}
                alt="AI Generated"
                className="w-full h-auto object-cover cursor-pointer hover:scale-[1.01] transition-transform"
                onClick={() => setLightboxImg(message.generatedImageUrl || null)}
              />
              <div className="absolute top-2 end-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setLightboxImg(message.generatedImageUrl || null)}
                  className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors shadow-sm"
                  title={isRtl ? 'تكبير' : 'Zoom'}
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  onClick={() => handleDownloadImage(message.generatedImageUrl!)}
                  className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors shadow-sm"
                  title={isRtl ? 'تنزيل الصورة' : 'Download image'}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Markdown Rendered Content */}
          <div className={`suly-prose text-sm md:text-[15px] leading-relaxed text-[#0d0d0d] dark:text-[#ececec] ${message.isStreaming ? 'typing-cursor' : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1].toLowerCase() : '';
                  const codeString = String(children).replace(/\n$/, '');

                  // Check if previewable in Sandbox
                  const isPreviewable = ['html', 'svg', 'xml', 'javascript', 'js', 'jsx', 'css'].includes(language) || codeString.trim().startsWith('<svg');

                  if (!inline && (language || isPreviewable)) {
                    return (
                      <div className="my-3 rounded-xl overflow-hidden border border-neutral-300 dark:border-white/10 shadow-sm">
                        {/* Code Header Bar */}
                        <div className="flex items-center justify-between px-4 py-1.5 bg-[#e9e9e9] dark:bg-[#2d2d2d] text-xs font-mono text-[#5d5d5d] dark:text-[#b4b4b4]">
                          <span>{language || 'code'}</span>
                          <div className="flex items-center gap-2">
                            {/* Canvas Open Button */}
                            {onOpenInCanvas && (
                              <button
                                onClick={() => onOpenInCanvas(codeString, language || 'typescript')}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 font-sans font-medium transition-colors"
                                title={isRtl ? 'فتح في مساحة العمل Canvas' : 'Open in Canvas'}
                              >
                                <FileEdit size={11} />
                                <span>{isRtl ? 'كانفاس' : 'Canvas'}</span>
                              </button>
                            )}

                            {/* Live Sandbox Preview button */}
                            {isPreviewable && (
                              <button
                                onClick={() => {
                                  setPreviewCode(codeString);
                                  setPreviewLang(language || 'html');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-sans font-semibold transition-colors"
                              >
                                <Play size={11} fill="currentColor" />
                                <span>{isRtl ? 'معاينة حية' : 'Preview'}</span>
                              </button>
                            )}

                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(codeString)}
                              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                              {copied ? (
                                <>
                                  <Check size={12} className="text-emerald-500" />
                                  <span className="text-emerald-500">{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>{isRtl ? 'نسخ الكود' : 'Copy code'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Code Content */}
                        <pre className="p-4 bg-[#f4f4f4] dark:bg-[#1e1e1e] overflow-x-auto text-xs font-mono leading-relaxed text-[#0d0d0d] dark:text-[#ececec]">
                          <code {...props}>{children}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="px-1.5 py-0.5 rounded-md bg-neutral-200 dark:bg-white/10 font-mono text-xs text-[#0d0d0d] dark:text-[#ececec]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Interactive Data Chart if tabular figures exist */}
          {sampleChartData && (
            <DataChart
              title={isRtl ? 'المخطط البياني التفاعلي للبيانات' : 'Interactive Data Chart'}
              data={sampleChartData}
              isRtl={isRtl}
            />
          )}

          {/* Action Toolbar & Stats */}
          {!message.isStreaming && (
            <div className="flex items-center justify-between pt-1 text-[#8e8e8e]">
              <div className="flex items-center gap-1">
                {/* Copy message */}
                <button
                  onClick={() => handleCopy(message.content)}
                  className="p-1.5 rounded-lg hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
                  title={isRtl ? 'نسخ النص' : 'Copy'}
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>

                {/* Read aloud */}
                <button
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-lg hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors ${
                    isSpeaking ? 'text-emerald-500' : ''
                  }`}
                  title={isRtl ? 'قراءة بصوت عالٍ' : 'Read aloud'}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>

                {/* Thumbs up */}
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`p-1.5 rounded-lg hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors ${
                    feedback === 'up' ? 'text-emerald-500' : ''
                  }`}
                  title={isRtl ? 'إجابة جيدة' : 'Good response'}
                >
                  <ThumbsUp size={14} />
                </button>

                {/* Thumbs down */}
                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`p-1.5 rounded-lg hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors ${
                    feedback === 'down' ? 'text-red-500' : ''
                  }`}
                  title={isRtl ? 'إجابة غير دقيقة' : 'Bad response'}
                >
                  <ThumbsDown size={14} />
                </button>

                {/* Regenerate (if last message) */}
                {isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
                    title={isRtl ? 'إعادة التوليد' : 'Regenerate'}
                  >
                    <RotateCw size={14} />
                  </button>
                )}
              </div>

              {/* Metrics Token Counter & Duration */}
              {message.metrics && (
                <div className="text-[11px] font-mono text-[#8e8e8e] select-none flex items-center gap-1.5">
                  <span>~{message.metrics.tokenCount} tokens</span>
                  <span>·</span>
                  <span>{(message.metrics.durationMs / 1000).toFixed(1)}s</span>
                  {message.modelUsed && (
                    <>
                      <span>·</span>
                      <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-white/10">
                        {message.modelUsed}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Preview Modal */}
      {previewCode && (
        <CodePreviewModal
          isOpen={!!previewCode}
          onClose={() => setPreviewCode(null)}
          code={previewCode}
          language={previewLang}
          isRtl={isRtl}
        />
      )}

      {/* Image Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img src={lightboxImg} alt="Enlarged preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(lightboxImg);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs shadow-lg hover:bg-neutral-200 transition-colors"
              >
                <Download size={14} />
                <span>{isRtl ? 'تنزيل الصورة' : 'Download Image'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileDown,
  Sparkles,
  Code2,
  Clock,
} from 'lucide-react';
import { Message } from '../types';
import { CodeBlockRunner } from './CodeBlockRunner';
import { soundController } from '../utils/audio';

interface MessageItemProps {
  message: Message;
  onOpenInCanvas?: (code: string, language: string) => void;
  onExportMessage?: (msg: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenInCanvas,
  onExportMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      soundController.playClick();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner voice recitation
    const cleanSpeechText = message.content
      .replace(/```[\s\S]*?```/g, 'كود برمجي مرفق في المحادثة')
      .replace(/[*_#`~>]/g, '')
      .slice(0, 800);

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = /[\u0600-\u06FF]/.test(cleanSpeechText) ? 'ar-SA' : 'en-US';
    utterance.rate = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Parse message content into text parts and code blocks
  const renderFormattedContent = () => {
    const raw = message.content;
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(raw)) !== null) {
      const textBefore = raw.substring(lastIndex, match.index);
      if (textBefore) {
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed space-y-2">
            {renderMarkdownParagraphs(textBefore)}
          </div>
        );
      }

      const lang = match[1] || 'text';
      const code = match[2];
      elements.push(
        <CodeBlockRunner
          key={`code-${blockIndex++}`}
          language={lang}
          code={code}
          onOpenInCanvas={onOpenInCanvas}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = raw.substring(lastIndex);
    if (remainingText) {
      elements.push(
        <div key={`text-end`} className="whitespace-pre-wrap leading-relaxed space-y-2">
          {renderMarkdownParagraphs(remainingText)}
        </div>
      );
    }

    return elements;
  };

  return (
    <div
      className={`py-4 px-3 sm:px-6 transition-colors ${
        isAssistant
          ? 'bg-[#0d0f14]/60 border-y border-[#181c25]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#222530] to-[#07080a] border border-[#d4af37]/60 flex items-center justify-center shadow-md shadow-[#d4af37]/15">
              <span className="text-[#f3e5ab] font-bold text-xs font-mono">SU</span>
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#07080a]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#1e2330] border border-[#2d3445] flex items-center justify-center text-xs font-bold text-stone-300">
              أنت
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">
                {isAssistant ? 'SULY AI' : 'أنت'}
              </span>
              {isAssistant && (
                <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.2 rounded-full border border-[#d4af37]/20 flex items-center gap-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5" />
                  gemini-3.8-flash
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-stone-500">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(message.timestamp).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="text-stone-200 text-sm leading-relaxed overflow-hidden">
            {renderFormattedContent()}
          </div>

          {/* Message Toolbar for Assistant */}
          {isAssistant && message.status !== 'streaming' && (
            <div className="mt-3 pt-2 border-t border-[#1a1f2b] flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#181c25] hover:text-[#d4af37] transition-colors"
                  title="نسخ النص كاملاً"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-[#181c25] transition-colors ${
                    isSpeaking ? 'text-[#d4af37] bg-[#d4af37]/10' : 'hover:text-[#d4af37]'
                  }`}
                  title="قراءة صوتية بليغة (TTS)"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>إيقاف الصوت</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>قراءة صوتية</span>
                    </>
                  )}
                </button>

                {onExportMessage && (
                  <button
                    onClick={() => onExportMessage(message)}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#181c25] hover:text-[#d4af37] transition-colors"
                    title="تصدير هذا الرد كتقرير رسمي"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>تصدير</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                {message.latencyMs ? <span>⚡ {message.latencyMs}ms</span> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper for inline Markdown highlighting (bold, lists, headers, quotes)
function renderMarkdownParagraphs(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-base font-bold text-[#f3e5ab] mt-3 mb-1 border-b border-[#232938] pb-1">
          {formatInline(trimmed.slice(4))}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-lg font-extrabold text-[#f3e5ab] mt-4 mb-2 border-b border-[#d4af37]/30 pb-1">
          {formatInline(trimmed.slice(3))}
        </h2>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={idx} className="text-xl font-black text-white mt-4 mb-2 text-gold-gradient">
          {formatInline(trimmed.slice(2))}
        </h1>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={idx} className="mr-4 list-disc text-stone-300">
          {formatInline(trimmed.slice(2))}
        </li>
      );
    }
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-r-2 border-[#d4af37] pr-3 py-1 my-2 bg-[#13161f]/50 text-stone-300 italic rounded-l">
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
    }

    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }

    return (
      <p key={idx} className="text-stone-200">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key++} className="font-bold text-[#f3e5ab]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={key++} className="italic text-stone-300">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-[#181c26] text-[#d4af37] font-mono text-xs border border-[#262c3d]">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts;
}

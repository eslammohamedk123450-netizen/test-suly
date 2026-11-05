import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Square,
  Mic,
  Paperclip,
  Sparkles,
  Code2,
  FileText,
  Brain,
  Terminal,
  Zap,
} from 'lucide-react';
import { Message, Conversation, MemoryItem } from '../types';
import { MessageItem } from './MessageItem';
import { soundController } from '../utils/audio';

interface ChatAreaProps {
  conversation: Conversation;
  onSendMessage: (text: string) => Promise<void | string>;
  isLoading: boolean;
  onStopGeneration?: () => void;
  onOpenInCanvas: (code: string, language: string) => void;
  onExportMessage: (msg: Message) => void;
  onOpenVoice: () => void;
  activeMemories: MemoryItem[];
  projectName: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  onSendMessage,
  isLoading,
  onStopGeneration,
  onOpenInCanvas,
  onExportMessage,
  onOpenVoice,
  activeMemories,
  projectName,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    soundController.playSend();
    onSendMessage(text);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const starterPrompts = [
    {
      title: 'تشغيل سكريبت Python حي',
      desc: 'حساب خوارزمية تسريع البيانات وتحليلها مباشرة',
      prompt: `اكتب لي كود بايثون تفاعلي متقدم يقوم بمحاكاة حساب الفائدة المركبة أو تحليل مصفوفة بيانات إحصائية، مع طباعة المخرجات بدقة عبر print().`,
      icon: Terminal,
    },
    {
      title: 'صياغة تقرير استراتيجي فاخر',
      desc: 'تقرير أعمال متكامل قابل للتصدير كـ PDF',
      prompt: `قم بإعداد تقرير استراتيجي تنفيذي رفيع المستوى حول (الذكاء الاصطناعي السيادي وحماية البيانات المؤسسية)، بصياغة فصحى راقية، بليغة ومباشرة ومقسمة بوضوح.`,
      icon: FileText,
    },
    {
      title: 'بناء واجهة تفاعلية بالـ Canvas',
      desc: 'كود HTML / SVG متحرك بلمسات ذهبية',
      prompt: `قم بإنشاء كود HTML وCSS تفاعلي لبطاقة رقمية فاخرة (Digital Luxury Card) مع تأثير توهج ذهبي ناعم عند مرور المؤشر.`,
      icon: Code2,
    },
    {
      title: 'فحص الذاكرة وتخصيص الأسلوب',
      desc: 'استعراض تفضيلاتي وطريقة عمل SULY AI',
      prompt: `كيف تستفيد من الذاكرة التراكمية وسياق مشروعي الحالي لتقديم أفضل استجابة تقنية بدون حشو؟`,
      icon: Brain,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#07080a] relative overflow-hidden">
      {/* Background radial luxury aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#d4af37]/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {conversation.messages.length === 0 ? (
          /* SULY AI Welcome Hero */
          <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center text-center">
            {/* Crest Emblem */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1c1f2b] to-[#07080a] border-2 border-[#d4af37]/70 flex items-center justify-center shadow-xl shadow-[#d4af37]/20">
                <span className="text-[#f3e5ab] font-extrabold text-2xl tracking-widest font-mono">
                  SULY
                </span>
              </div>
              <div className="absolute -inset-2 rounded-3xl border border-[#d4af37]/20 animate-pulse pointer-events-none" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              مرحباً بك في <span className="text-gold-gradient">SULY AI</span>
            </h1>
            <p className="text-stone-300 text-sm max-w-xl leading-relaxed mb-8">
              منصة الذكاء الاصطناعي الموثوقة فائقة الفخامة، مدعومة بمحرك{' '}
              <strong className="text-[#f3e5ab]">جيميني 3.8 فلاش</strong>. لغة فصحى راقية، تشغيل حي للأكواد،
              مركز تصدير احترافي، وذاكرة تراكمية تحفظ تفضيلاتك بدقة.
            </p>

            {/* Starter Suggestion Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-right">
              {starterPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(item.prompt);
                      soundController.playClick();
                    }}
                    className="p-4 rounded-2xl bg-[#0d0f14]/80 border border-[#1f2430] hover:border-[#d4af37]/50 hover:bg-[#13161f] transition-all flex items-start gap-3 text-right group shadow-lg shadow-black/20"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#161a24] border border-[#232938] text-[#d4af37] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:border-[#d4af37]/40 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#f3e5ab] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#181c25]/50 pb-6">
            {conversation.messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onOpenInCanvas={onOpenInCanvas}
                onExportMessage={onExportMessage}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 sm:p-5 bg-gradient-to-t from-[#07080a] via-[#07080a]/95 to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Active Context Indicators */}
          <div className="flex items-center gap-2 mb-2 px-1 text-[11px] text-stone-400 overflow-x-auto">
            <span className="flex items-center gap-1 bg-[#0d0f14] border border-[#1f2430] px-2.5 py-0.5 rounded-full text-stone-300">
              <Zap className="w-3 h-3 text-[#d4af37]" />
              <span>جيميني 3.8 فلاش</span>
            </span>

            {activeMemories.length > 0 && (
              <span className="flex items-center gap-1 bg-[#0d0f14] border border-[#1f2430] px-2.5 py-0.5 rounded-full text-stone-300">
                <Brain className="w-3 h-3 text-[#d4af37]" />
                <span>{activeMemories.length} تفضيلات في الذاكرة</span>
              </span>
            )}

            <span className="flex items-center gap-1 bg-[#0d0f14] border border-[#1f2430] px-2.5 py-0.5 rounded-full text-stone-400 truncate max-w-[200px]">
              <span>المشروع:</span>
              <strong className="text-stone-200">{projectName}</strong>
            </span>
          </div>

          {/* Input Container */}
          <div className="relative rounded-2xl bg-[#0d0f14] border border-[#1f2430] focus-within:border-[#d4af37] focus-within:shadow-lg focus-within:shadow-[#d4af37]/10 transition-all shadow-xl shadow-black/40">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="اطلب من SULY AI كتابة كود، تشغيل سكريبت، صياغة تقرير، أو تحليل فكرة..."
              className="w-full bg-transparent px-4 py-3.5 pr-4 pl-24 text-sm text-stone-100 placeholder-stone-500 focus:outline-none resize-none leading-relaxed"
              style={{ maxHeight: '180px' }}
            />

            {/* Input Action Buttons */}
            <div className="absolute left-2.5 bottom-2 flex items-center gap-1.5">
              {/* Voice button */}
              <button
                onClick={onOpenVoice}
                className="p-2 rounded-xl text-stone-400 hover:text-[#d4af37] hover:bg-[#181c25] transition-colors"
                title="تحدث صوتياً"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Stop / Send Button */}
              {isLoading ? (
                <button
                  onClick={onStopGeneration}
                  className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-md"
                  title="إيقاف التوليد"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    inputText.trim()
                      ? 'bg-gradient-to-br from-[#d4af37] to-[#aa7c11] text-[#07080a] shadow-md shadow-[#d4af37]/20 hover:brightness-110 active:scale-95'
                      : 'bg-[#181c25] text-stone-600 cursor-not-allowed'
                  }`}
                  title="إرسال (Enter)"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          <div className="text-[10px] text-stone-500 text-center mt-2">
            اضغط Enter للإرسال، Shift + Enter لسطر جديد • يتم تشغيل الأكواد بأمان داخل بيئة المتصفح المعزولة
          </div>
        </div>
      </div>
    </div>
  );
};

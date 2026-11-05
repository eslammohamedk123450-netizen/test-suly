import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Globe,
  Lightbulb,
  Mic,
  MicOff,
  Headphones,
  X,
  FileText,
  Image,
  Sparkles,
  Code,
  BarChart3,
  BookOpen,
  FileCode,
  Eye,
} from 'lucide-react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[], webSearch: boolean, reasoning: boolean) => void;
  isGenerating: boolean;
  onStopGenerating: () => void;
  onOpenVoiceMode: () => void;
  onInspectFile?: (attachment: Attachment) => void;
  onOpenCanvas?: (type: 'code' | 'document') => void;
  isRtl?: boolean;
}

interface SlashCommand {
  cmd: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  onOpenVoiceMode,
  onInspectFile,
  onOpenCanvas,
  isRtl = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [reasoningActive, setReasoningActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
    // Check if input begins with /
    if (inputText.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, [inputText]);

  // Handle Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isRtl ? 'خاصية التعرف على الصوت غير مدعومة في متصفحك الحالي.' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = isRtl ? 'ar-SA' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = event.target?.result as string;
        let textContent: string | undefined = undefined;

        // If file is text, csv, json, code, read its text
        if (!isImg) {
          try {
            textContent = await file.text();
          } catch {}
        }

        const newAttachment: Attachment = {
          id: 'att-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data,
          size: file.size,
          type: isImg ? 'image' : 'file',
          textContent,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = () => {
    if ((!inputText.trim() && attachments.length === 0) || isGenerating) return;

    onSendMessage(inputText.trim(), attachments, webSearchActive, reasoningActive);
    setInputText('');
    setAttachments([]);
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  // Slash commands registry
  const slashCommands: SlashCommand[] = [
    {
      cmd: '/image',
      label: isRtl ? 'صياغة وصف لصورة' : 'Write an image prompt',
      description: isRtl ? 'اكتب وصفًا تفصيليًا يمكنك استخدامه مع أداة صور خارجية' : 'Write a detailed prompt for an external image tool',
      icon: <Sparkles size={16} className="text-emerald-500" />,
      action: () => {
        setInputText(isRtl ? 'ساعدني في كتابة وصف تفصيلي لصورة عن ' : 'Help me write a detailed prompt for an image of ');
        setShowSlashMenu(false);
      },
    },
    {
      cmd: '/canvas',
      label: isRtl ? 'فتح محرر Canvas' : 'Open Canvas Editor',
      description: isRtl ? 'مساحة عمل متزامنة لكتابة وتعديل الكود أو النصوص' : 'Interactive side-by-side editing canvas',
      icon: <FileCode size={16} className="text-purple-400" />,
      action: () => {
        if (onOpenCanvas) onOpenCanvas('code');
        setInputText('');
        setShowSlashMenu(false);
      },
    },
    {
      cmd: '/code',
      label: isRtl ? 'كتابة وتصحيح كود' : 'Write & Debug Code',
      description: isRtl ? 'توليد كود نظيف مع زر المعاينة الحية' : 'Generate clean code with Live Sandbox Preview',
      icon: <Code size={16} className="text-blue-500" />,
      action: () => {
        setInputText(isRtl ? 'اكتب لي كود HTML/CSS/JS تفاعلي لـ ' : 'Write interactive code for ');
        setShowSlashMenu(false);
      },
    },
    {
      cmd: '/chart',
      label: isRtl ? 'رسم بياني للبيانات' : 'Data Visualization',
      description: isRtl ? 'رسم مخطط بياني تفاعلي (Bar/Line Chart)' : 'Visualize numbers in interactive charts',
      icon: <BarChart3 size={16} className="text-amber-500" />,
      action: () => {
        setInputText(isRtl ? 'حلل هذه الأرقام واعرضها في جدول ورسم بياني: ' : 'Analyze and chart this data: ');
        setShowSlashMenu(false);
      },
    },
    {
      cmd: '/web',
      label: isRtl ? 'بحث في الويب' : 'Search the Web',
      description: isRtl ? 'تفعيل البحث المباشر في الإنترنت للحصول على أحدث المعلومات' : 'Enable live Google search grounding',
      icon: <Globe size={16} className="text-cyan-500" />,
      action: () => {
        setWebSearchActive(true);
        setInputText('');
        setShowSlashMenu(false);
      },
    },
    {
      cmd: '/reason',
      label: isRtl ? 'تفكير عميق خطوة بخطوة' : 'Deep Reasoning',
      description: isRtl ? 'تفعيل التفكير المنطقي المتسلسل لحل المسائل المعقدة' : 'Enable step-by-step thinking for complex STEM',
      icon: <Lightbulb size={16} className="text-amber-400" />,
      action: () => {
        setReasoningActive(true);
        setInputText('');
        setShowSlashMenu(false);
      },
    },
    {
      cmd: '/summarize',
      label: isRtl ? 'تلخيص نص أو ملف' : 'Summarize Content',
      description: isRtl ? 'تلخيص واستخراج النقاط الجوهرية بأسلوب تنفيذي' : 'Executive bullet-point summary',
      icon: <BookOpen size={16} className="text-emerald-400" />,
      action: () => {
        setInputText(isRtl ? 'لخص لي النص التالي في 3 نقاط رئيسية وخطة عمل: ' : 'Summarize the following text in 3 key points: ');
        setShowSlashMenu(false);
      },
    },
  ];

  const hasContent = inputText.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        accept="image/*,.pdf,.txt,.csv,.json,.doc,.docx,.js,.ts,.py"
      />

      {/* Floating Slash Commands Menu */}
      {showSlashMenu && (
        <div className="absolute bottom-full start-4 end-4 mb-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 z-40 max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
            {isRtl ? 'الأوامر السريعة (Slash Commands)' : 'Slash Commands'}
          </div>
          <div className="space-y-0.5">
            {slashCommands.map((command) => (
              <button
                key={command.cmd}
                onClick={command.action}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-start cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  {command.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0d0d0d] dark:text-[#ececec]">
                      {command.cmd}
                    </span>
                    <span className="text-xs text-[#5d5d5d] dark:text-[#b4b4b4] font-medium">
                      {command.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e8e8e] truncate mt-0.5">
                    {command.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Rounded Capsule Container */}
      <div className="relative rounded-[26px] bg-[#f4f4f4] dark:bg-[#2f2f2f] border border-[#e3e3e3] dark:border-white/10 p-2.5 shadow-sm transition-all focus-within:border-neutral-400 dark:focus-within:border-white/20">
        {/* Attachment Preview Tray */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                onClick={() => onInspectFile && onInspectFile(att)}
                className="group relative flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-[#212121] border border-neutral-300 dark:border-white/10 text-xs shadow-xs cursor-pointer hover:border-emerald-500 transition-colors"
                title={isRtl ? 'انقر لمعاينة وتحليل الملف' : 'Click to inspect file'}
              >
                {att.type === 'image' ? (
                  <img src={att.data} alt={att.name} className="w-9 h-9 object-cover rounded-lg" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                )}
                <div className="max-w-[120px] truncate pr-4 text-start font-medium">
                  {att.name}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttachment(att.id);
                  }}
                  className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-neutral-600 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRtl ? 'اكتب رسالة إلى SULY... (اكتب / للأوامر السريعة)' : 'Message SULY... (type / for commands)'}
          rows={1}
          className="w-full bg-transparent resize-none px-3 pt-1 pb-2 text-sm md:text-[15px] leading-relaxed text-[#0d0d0d] dark:text-[#ececec] placeholder-[#8e8e8e] focus:outline-none max-h-[200px]"
        />

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Buttons: Attachments, Web Search, Reasoning */}
          <div className="flex items-center gap-1">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
              title={isRtl ? 'إرفاق ملفات أو صور (CSV, PDF, JSON)' : 'Attach files or images'}
            >
              <Paperclip size={18} />
            </button>

            {/* Web Search Toggle */}
            <button
              onClick={() => setWebSearchActive(!webSearchActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                webSearchActive
                  ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                  : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d0d0d] dark:hover:text-[#ececec]'
              }`}
              title={isRtl ? 'البحث في الويب' : 'Search the web'}
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{isRtl ? 'بحث' : 'Search'}</span>
            </button>

            {/* Reasoning Toggle */}
            <button
              onClick={() => setReasoningActive(!reasoningActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                reasoningActive
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d0d0d] dark:hover:text-[#ececec]'
              }`}
              title={isRtl ? 'تفكير عميق خطوة بخطوة' : 'Deep step-by-step reasoning'}
            >
              <Lightbulb size={14} />
              <span className="hidden sm:inline">{isRtl ? 'تفكير' : 'Reason'}</span>
            </button>
          </div>

          {/* Right Buttons: Voice Dictation, Voice Mode, Send / Stop */}
          <div className="flex items-center gap-1.5">
            {/* Voice Dictation (Mic) */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d0d0d] dark:hover:text-[#ececec]'
              }`}
              title={isRtl ? 'الإملاء الصوتي' : 'Voice dictation'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Voice Mode Launcher (Waveform) */}
            <button
              onClick={onOpenVoiceMode}
              className="p-2 rounded-full text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors"
              title={isRtl ? 'المحادثة الصوتية التفاعلية' : 'Voice mode'}
            >
              <Headphones size={18} />
            </button>

            {/* Send or Stop Button */}
            {isGenerating ? (
              <button
                onClick={onStopGenerating}
                className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm"
                title={isRtl ? 'إيقاف التوليد' : 'Stop generating'}
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!hasContent}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  hasContent
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 cursor-pointer shadow-sm'
                    : 'bg-neutral-300 dark:bg-neutral-700/60 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                }`}
                title={isRtl ? 'إرسال الرسالة (Enter)' : 'Send message (Enter)'}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footnote Disclaimer */}
      <div className="text-center pt-2 text-[11px] text-[#8e8e8e] tracking-tight">
        {isRtl
          ? 'يمكن أن يرتكب SULY أخطاء. تحقق من المعلومات المهمة.'
          : 'SULY can make mistakes. Check important info.'}
      </div>
    </div>
  );
};

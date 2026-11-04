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
} from 'lucide-react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[], webSearch: boolean, reasoning: boolean) => void;
  isGenerating: boolean;
  onStopGenerating: () => void;
  onOpenVoiceMode: () => void;
  isRtl?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  onOpenVoiceMode,
  isRtl = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [reasoningActive, setReasoningActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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

      reader.onload = (event) => {
        const data = event.target?.result as string;
        const newAttachment: Attachment = {
          id: 'att-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data,
          size: file.size,
          type: isImg ? 'image' : 'file',
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = inputText.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        accept="image/*,.pdf,.txt,.csv,.json,.doc,.docx"
      />

      {/* Main Rounded Capsule Container */}
      <div className="relative rounded-[26px] bg-[#f4f4f4] dark:bg-[#2f2f2f] border border-[#e3e3e3] dark:border-white/10 p-2.5 shadow-sm transition-all focus-within:border-neutral-400 dark:focus-within:border-white/20">
        {/* Attachment Preview Tray */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-[#212121] border border-neutral-300 dark:border-white/10 text-xs shadow-xs"
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
                  onClick={() => removeAttachment(att.id)}
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
          placeholder={isRtl ? 'اكتب رسالة إلى ChatGPT...' : 'Message ChatGPT...'}
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
              title={isRtl ? 'إرفاق ملفات أو صور' : 'Attach files or images'}
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
          ? 'يمكن أن يرتكب ChatGPT أخطاء. تحقق من المعلومات المهمة.'
          : 'ChatGPT can make mistakes. Check important info.'}
      </div>
    </div>
  );
};

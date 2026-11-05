import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Globe, Sparkles, Loader2 } from 'lucide-react';
import { soundController } from '../utils/audio';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<string | void>;
}

// Global speech recognition types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [language, setLanguage] = useState<'ar-SA' | 'en-US'>('ar-SA');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopAll();
      return;
    }

    soundController.playVoiceToggle();
    startListening();

    return () => {
      stopAll();
    };
  }, [isOpen, language]);

  const stopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
  };

  // Fluid Audio Visualizer Canvas Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;

    const render = () => {
      step += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Base intensity based on state
      let amp = 20;
      if (isListening) amp = 35 + Math.sin(step * 3) * 15;
      if (isThinking) amp = 15 + Math.sin(step * 5) * 8;
      if (isSpeaking) amp = 50 + Math.sin(step * 4) * 25;

      // Draw 3 glowing luxury golden orbital waves
      for (let ring = 0; ring < 3; ring++) {
        const radius = 60 + ring * 28 + (isSpeaking ? Math.sin(step * 2 + ring) * 15 : 0);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const distortion = Math.sin(a * 6 + step * 2 + ring) * (amp * 0.25);
          const r = radius + distortion;
          const x = centerX + Math.cos(a) * r;
          const y = centerY + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const alpha = 0.2 + ring * 0.25;
        ctx.strokeStyle = ring === 1 ? `rgba(243, 229, 171, ${alpha})` : `rgba(212, 175, 55, ${alpha})`;
        ctx.lineWidth = ring === 1 ? 3 : 1.5;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 15;
        ctx.stroke();
      }

      // Center glowing core
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        45
      );
      coreGradient.addColorStop(0, '#f3e5ab');
      coreGradient.addColorStop(0.5, '#d4af37');
      coreGradient.addColorStop(1, 'rgba(170, 124, 17, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 35 + (isSpeaking ? Math.sin(step * 4) * 8 : 0), 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isListening, isThinking, isSpeaking]);

  const startListening = () => {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) {
      setTranscript('عذراً، متصفحك لا يدعم التعرف على الصوت المباشر عبر Web Speech API.');
      return;
    }

    try {
      const recognition = new SpeechClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        let currentText = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          currentText += e.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (e.results[e.results.length - 1].isFinal) {
          handleVoiceQuery(currentText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    if (!query.trim()) return;

    soundController.playSend();
    setIsListening(false);
    setIsThinking(true);

    try {
      const reply = await onSendMessage(query);
      setIsThinking(false);

      if (reply) {
        setAssistantReply(reply);
        speakResponse(reply);
      }
    } catch {
      setIsThinking(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown symbols for speech
    const clean = text
      .replace(/```[\s\S]*?```/g, 'تم إرفاق الكود في المحادثة')
      .replace(/[*_#`~>]/g, '')
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language;
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      soundController.playComplete();
      // Resume listening
      setTimeout(() => {
        if (isOpen) startListening();
      }, 1000);
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6">
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#d4af37] animate-ping" />
          <span className="font-bold text-sm tracking-wider text-white">
            الوضع الصوتي المتقدم • <span className="text-gold-gradient">SULY AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newLang = language === 'ar-SA' ? 'en-US' : 'ar-SA';
              setLanguage(newLang);
              soundController.playClick();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#13161f] border border-[#232938] text-xs text-[#f3e5ab] hover:border-[#d4af37]/40 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{language === 'ar-SA' ? 'العربية' : 'English'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#181c25] text-stone-400 hover:text-white transition-colors"
            title="إغلاق الوضع الصوتي"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fluid Dynamic Audio Visualizer */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="max-w-[320px] max-h-[320px] sm:max-w-[360px] sm:max-h-[360px]"
        />

        {/* Status Text */}
        <div className="mt-6 text-center">
          <div className="text-lg font-bold text-white flex items-center justify-center gap-2">
            {isThinking && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span className="text-[#f3e5ab]">SULY يفكر ويصيغ الرد...</span>
              </>
            )}
            {isListening && (
              <>
                <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300">أستمع إليك الآن... تحدث بحرية</span>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-4 h-4 text-[#d4af37] animate-pulse" />
                <span className="text-gold-gradient">SULY يتحدث إليك...</span>
              </>
            )}
            {!isListening && !isThinking && !isSpeaking && (
              <span className="text-stone-400">انقر على الميكروفون لبدء الحديث</span>
            )}
          </div>
        </div>

        {/* Live speech transcripts */}
        {(transcript || assistantReply) && (
          <div className="mt-4 max-w-lg text-center px-4 py-3 rounded-2xl bg-[#0d0f14]/80 border border-[#1f2430] backdrop-blur-md">
            {transcript && (
              <p className="text-sm text-stone-200 font-medium">"{transcript}"</p>
            )}
            {assistantReply && !transcript && (
              <p className="text-xs text-stone-400 italic line-clamp-3">"{assistantReply}"</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-sm flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => {
            if (isListening) {
              if (recognitionRef.current) recognitionRef.current.stop();
              setIsListening(false);
            } else {
              startListening();
            }
            soundController.playClick();
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isListening
              ? 'bg-rose-500 text-white shadow-rose-500/20'
              : 'bg-gradient-to-br from-[#d4af37] to-[#aa7c11] text-[#07080a] shadow-[#d4af37]/30'
          }`}
          title={isListening ? 'إيقاف الاستماع' : 'بدء الاستماع'}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

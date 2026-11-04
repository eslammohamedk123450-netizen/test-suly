import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, PhoneOff, Volume2, Sparkles, Check } from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/storage';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceQuery: (query: string) => Promise<string>;
  currentVoice: string;
  onChangeVoice: (voice: any) => void;
  isRtl?: boolean;
}

const VOICES = ['Juniper', 'Breeze', 'Cove', 'Ember', 'Sky'];

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceQuery,
  currentVoice,
  onChangeVoice,
  isRtl = false,
}) => {
  const [status, setStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceDropdown, setVoiceDropdown] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Start voice interaction loop
    setStatus('listening');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && !isMuted) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = isRtl ? 'ar-SA' : 'en-US';
        rec.continuous = false;
        rec.interimResults = true;

        rec.onresult = (e: any) => {
          const text = Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setTranscript(text);
        };

        rec.onend = async () => {
          if (transcript.trim()) {
            setStatus('thinking');
            try {
              const answer = await onSendVoiceQuery(transcript.trim());
              setStatus('speaking');
              speakText(answer, currentVoice);
              setTimeout(() => {
                setStatus('listening');
                setTranscript('');
              }, 4000);
            } catch {
              setStatus('listening');
            }
          } else {
            // Keep listening
            try {
              rec.start();
            } catch {}
          }
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (err) {
        console.error(err);
      }
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isOpen, isMuted, isRtl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#171717]/95 backdrop-blur-2xl text-white select-none">
      {/* Top Bar Controls */}
      <div className="w-full flex items-center justify-between max-w-xl mx-auto">
        <div className="relative">
          <button
            onClick={() => setVoiceDropdown(!voiceDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs font-medium"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>{currentVoice}</span>
          </button>

          {voiceDropdown && (
            <div className="absolute start-0 top-full mt-2 w-36 bg-[#212121] border border-white/10 rounded-xl shadow-2xl py-1 text-xs z-50">
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    onChangeVoice(v);
                    setVoiceDropdown(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/5 text-start"
                >
                  <span>{v}</span>
                  {currentVoice === v && <Check size={14} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs font-medium text-white/60 tracking-wider uppercase">
          {status === 'listening' && (isRtl ? 'أستمع إليك...' : 'Listening...')}
          {status === 'thinking' && (isRtl ? 'جاري التفكير...' : 'Thinking...')}
          {status === 'speaking' && (isRtl ? 'يتحدث الآن...' : 'Speaking...')}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Central Fluid Pulsing ChatGPT Orb */}
      <div className="flex-1 flex flex-col items-center justify-center my-8">
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full transition-all duration-700 blur-2xl ${
              status === 'speaking'
                ? 'bg-gradient-to-tr from-emerald-500/40 via-teal-400/40 to-blue-500/40 scale-125 animate-pulse'
                : status === 'thinking'
                ? 'bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 scale-110 animate-spin'
                : 'bg-white/10 scale-95'
            }`}
          />

          {/* Core Orb */}
          <div
            className={`w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
              status === 'speaking'
                ? 'bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-400 scale-110 shadow-emerald-500/30'
                : status === 'thinking'
                ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 scale-100 shadow-purple-500/30'
                : 'bg-gradient-to-br from-neutral-200 to-neutral-400 scale-95 shadow-white/20'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.8956zm16.5995 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4037-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.4074 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219zm1.145-2.0154l3.3005-1.8994 3.3005 1.8994v3.8035l-3.3005 1.9042-3.3005-1.9042z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Live Transcript / Subtitle */}
        <div className="mt-8 text-center max-w-md px-4 min-h-[40px]">
          <p className="text-sm text-white/80 leading-relaxed font-medium">
            {transcript || (status === 'listening' ? (isRtl ? 'تحدث بحرية، أنا أسمعك...' : 'Say anything, I am listening...') : '')}
          </p>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-center gap-6 pb-6">
        {/* Mute button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-transform hover:scale-105 active:scale-95 shadow-xl"
          title={isRtl ? 'إنهاء المحادثة الصوتية' : 'End conversation'}
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

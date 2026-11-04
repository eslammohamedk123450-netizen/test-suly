import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock } from 'lucide-react';
import { Conversation } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  isRtl?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversation,
  isRtl = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const shareUrl = `${window.location.origin}/chat/${conversation.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-[#0d0d0d] dark:text-[#ececec]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-emerald-500" />
            <h3 className="text-base font-semibold">
              {isRtl ? 'مشاركة رابط المحادثة' : 'Share link to Chat'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
            <div className="text-xs font-semibold truncate mb-1">{conversation.title}</div>
            <div className="text-[11px] text-[#8e8e8e]">
              {conversation.messages.length} {isRtl ? 'رسالة في هذه المحادثة' : 'messages in this conversation'}
            </div>
          </div>

          <div className="text-xs text-[#8e8e8e] leading-relaxed">
            {isRtl
              ? 'أي شخص يملك هذا الرابط سيتمكن من عرض نسخة من المحادثة الحالية. لن تظهر الرسائل الجديدة التي ترسلها لاحقًا.'
              : 'Anyone with this link will be able to view this copy of the conversation. Future messages you send will remain private.'}
          </div>

          {/* Link box */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-black/30 border border-neutral-300 dark:border-white/10 text-xs">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent truncate focus:outline-none text-inherit text-start font-mono"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold shrink-0 hover:opacity-90 transition-opacity"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span>{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{isRtl ? 'نسخ الرابط' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, X, MessageSquare, ChevronRight, Calendar } from 'lucide-react';
import { Conversation } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConv: (id: string) => void;
  isRtl?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConv,
  isRtl = false,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations.slice(0, 8);
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/65 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#0d0d0d] dark:text-[#ececec]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-white/10">
          <Search size={18} className="text-[#8e8e8e] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث في محادثاتك وسجلات الرسائل...' : 'Search conversations...'}
            autoFocus
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#8e8e8e] hover:text-inherit"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded text-xs text-[#8e8e8e] hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((conv) => {
              const dateStr = new Date(conv.updatedAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConv(conv.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-start group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#2a2a2a] flex items-center justify-center shrink-0 text-[#8e8e8e] group-hover:text-emerald-500 transition-colors">
                      <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec] truncate">
                        {conv.title}
                      </div>
                      <div className="text-[11px] text-[#8e8e8e] truncate mt-0.5">
                        {conv.messages[conv.messages.length - 1]?.content.slice(0, 80) || 'محادثة فارغة'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ps-3 text-[11px] text-[#8e8e8e]">
                    <span>{dateStr}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs text-[#8e8e8e]">
              {isRtl ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching results found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { MemoryItem } from '../types';
import { soundController } from '../utils/audio';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onUpdateMemories: (updated: MemoryItem[]) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onUpdateMemories,
}) => {
  const [newText, setNewText] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('preference');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newMemory: MemoryItem = {
      id: `mem-${Date.now()}`,
      text: newText.trim(),
      category,
      enabled: true,
      createdAt: Date.now(),
    };

    onUpdateMemories([newMemory, ...memories]);
    setNewText('');
    soundController.playComplete();
  };

  const handleToggle = (id: string) => {
    const updated = memories.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    onUpdateMemories(updated);
    soundController.playClick();
  };

  const handleDelete = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    onUpdateMemories(updated);
    soundController.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0d0f14] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#13161f] border-b border-[#1f2430] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">الذاكرة الذكية التراكمية (Proactive Memory)</h2>
              <p className="text-[11px] text-stone-400">
                يتعلم SULY AI تفضيلاتك وأسلوبك التقني ويطبقها تلقائياً على كل المحادثات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1a1f2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAdd} className="p-4 bg-[#0a0c10] border-b border-[#181c25] flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="أضف تفضيلاً جديداً (مثال: أفضّل الأمثلة العملية مع شرح كود فوري)..."
              className="flex-1 bg-[#13161f] border border-[#232938] rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MemoryItem['category'])}
              className="bg-[#13161f] border border-[#232938] rounded-xl px-2.5 py-2 text-xs text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
            >
              <option value="preference">تفضيل عام</option>
              <option value="technical">تقني وبرمجة</option>
              <option value="persona">أسلوب التخاطب</option>
              <option value="custom">مخصص</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#07080a] font-bold text-xs hover:brightness-110 flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>
        </form>

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {memories.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              لا توجد ذكريات محفوظة حالياً. أضف تفضيلاتك ليحفظها SULY دائماً.
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  m.enabled
                    ? 'bg-[#10131a] border-[#222838]'
                    : 'bg-[#090b0e] border-[#161a24] opacity-50'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(m.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      m.enabled
                        ? 'bg-[#d4af37] border-[#d4af37] text-[#07080a]'
                        : 'border-stone-600'
                    }`}
                  >
                    {m.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <div>
                    <p className="text-xs text-stone-200 leading-relaxed">{m.text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#181c26] text-[#d4af37] border border-[#232938]">
                        {m.category === 'persona'
                          ? 'أسلوب التخاطب'
                          : m.category === 'technical'
                          ? 'برمجة وتقنية'
                          : m.category === 'preference'
                          ? 'تفضيل'
                          : 'مخصص'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(m.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="حذف هذا التفضيل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0c10] border-t border-[#181c25] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>يتم إدراج هذه الذاكرة تلقائياً في سياق جيميني 3.8 فلاش</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181c25] text-stone-200 hover:bg-[#232938] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

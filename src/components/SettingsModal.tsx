import React, { useState } from 'react';
import {
  X,
  Settings,
  Sliders,
  Volume2,
  Database,
  Moon,
  Sun,
  Laptop,
  Trash2,
  Download,
  Check,
  Archive,
  RotateCcw,
  Brain,
  Plus,
} from 'lucide-react';
import { AppSettings, Conversation } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  conversations: Conversation[];
  onClearAllChats: () => void;
  onUnarchiveConv?: (id: string) => void;
  onDeleteConv?: (id: string) => void;
  initialTab?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  conversations,
  onClearAllChats,
  onUnarchiveConv,
  onDeleteConv,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [aboutUser, setAboutUser] = useState(settings.customInstructions.aboutUser);
  const [responsePref, setResponsePref] = useState(settings.customInstructions.responsePreferences);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');

  const isRtl = settings.language === 'ar';
  const archivedConversations = conversations.filter((c) => c.isArchived);

  if (!isOpen) return null;

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    const newMem = {
      id: 'mem-' + Math.random().toString(36).substring(2, 9),
      content: newMemoryText.trim(),
      createdAt: Date.now(),
    };
    onUpdateSettings({
      memories: [newMem, ...(settings.memories || [])],
    });
    setNewMemoryText('');
  };

  const handleDeleteMemory = (id: string) => {
    onUpdateSettings({
      memories: (settings.memories || []).filter((m) => m.id !== id),
    });
  };

  const handleClearAllMemories = () => {
    if (confirm(isRtl ? 'هل أنت متأكد من مسح كافة الذكريات؟' : 'Clear all memories?')) {
      onUpdateSettings({ memories: [] });
    }
  };

  const handleSaveInstructions = () => {
    onUpdateSettings({
      customInstructions: {
        aboutUser,
        responsePreferences: responsePref,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `suly_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/10">
          <h3 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececec]">
            {isRtl ? 'الإعدادات' : 'Settings'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Left Tabs + Right Panel */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-[400px] overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-full sm:w-48 p-2 border-b sm:border-b-0 sm:border-e border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/10 shrink-0">
            <div className="flex sm:flex-col gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-start transition-colors ${
                  activeTab === 'general'
                    ? 'bg-neutral-200 dark:bg-white/10 text-[#0d0d0d] dark:text-[#ececec]'
                    : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Settings size={15} />
                <span>{isRtl ? 'عام' : 'General'}</span>
              </button>

              <button
                onClick={() => setActiveTab('personalization')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-start transition-colors ${
                  activeTab === 'personalization'
                    ? 'bg-neutral-200 dark:bg-white/10 text-[#0d0d0d] dark:text-[#ececec]'
                    : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Sliders size={15} />
                <span>{isRtl ? 'التخصيص' : 'Personalization'}</span>
              </button>

              <button
                onClick={() => setActiveTab('memory')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-start transition-colors ${
                  activeTab === 'memory'
                    ? 'bg-neutral-200 dark:bg-white/10 text-[#0d0d0d] dark:text-[#ececec]'
                    : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Brain size={15} />
                <span>{isRtl ? 'الذاكرة (Memory)' : 'Memory'}</span>
                {settings.memories?.length > 0 && (
                  <span className="ms-auto text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono">
                    {settings.memories.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('speech')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-start transition-colors ${
                  activeTab === 'speech'
                    ? 'bg-neutral-200 dark:bg-white/10 text-[#0d0d0d] dark:text-[#ececec]'
                    : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Volume2 size={15} />
                <span>{isRtl ? 'الصوت والكلام' : 'Speech'}</span>
              </button>

              <button
                onClick={() => setActiveTab('archived')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-start transition-colors ${
                  activeTab === 'archived'
                    ? 'bg-neutral-200 dark:bg-white/10 text-[#0d0d0d] dark:text-[#ececec]'
                    : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Archive size={15} />
                <span>{isRtl ? 'المحادثات المؤرشفة' : 'Archived Chats'}</span>
                {archivedConversations.length > 0 && (
                  <span className="ms-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-mono">
                    {archivedConversations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-start transition-colors ${
                  activeTab === 'data'
                    ? 'bg-neutral-200 dark:bg-white/10 text-[#0d0d0d] dark:text-[#ececec]'
                    : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Database size={15} />
                <span>{isRtl ? 'البيانات والخصوصية' : 'Data Controls'}</span>
              </button>
            </div>
          </div>

          {/* Tab Panel Content */}
          <div className="flex-1 p-5 overflow-y-auto text-xs text-[#0d0d0d] dark:text-[#ececec]">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    {isRtl ? 'المظهر (Theme)' : 'Theme'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onUpdateSettings({ theme: 'dark' })}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        settings.theme === 'dark'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                          : 'border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Moon size={14} />
                      <span>{isRtl ? 'داكن' : 'Dark'}</span>
                    </button>

                    <button
                      onClick={() => onUpdateSettings({ theme: 'light' })}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        settings.theme === 'light'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                          : 'border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Sun size={14} />
                      <span>{isRtl ? 'فاتح' : 'Light'}</span>
                    </button>

                    <button
                      onClick={() => onUpdateSettings({ theme: 'system' })}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        settings.theme === 'system'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                          : 'border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Laptop size={14} />
                      <span>{isRtl ? 'تلقائي' : 'System'}</span>
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    {isRtl ? 'اللغة واتجاه الواجهة' : 'Language'}
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => onUpdateSettings({ language: e.target.value as 'en' | 'ar' })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-transparent text-xs focus:outline-none"
                  >
                    <option value="ar" className="dark:bg-[#212121]">العربية (Arabic - RTL)</option>
                    <option value="en" className="dark:bg-[#212121]">English (US - LTR)</option>
                  </select>
                </div>

                <div className="h-px bg-neutral-200 dark:bg-white/10 my-4" />

                {/* Clear All Chats */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs">{isRtl ? 'مسح جميع المحادثات' : 'Clear all chats'}</div>
                    <div className="text-[11px] text-[#8e8e8e]">
                      {isRtl ? 'سيتم حذف سجل المحادثات نهائياً' : 'Permanently remove all chat history'}
                    </div>
                  </div>

                  {showClearConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-white/10 text-xs hover:bg-neutral-100 dark:hover:bg-white/5"
                      >
                        {isRtl ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        onClick={() => {
                          onClearAllChats();
                          setShowClearConfirm(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                      >
                        {isRtl ? 'تأكيد الحذف' : 'Confirm'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 font-semibold border border-red-500/20 transition-colors"
                    >
                      {isRtl ? 'حذف الكل' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Archived Chats Tab */}
            {activeTab === 'archived' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-white/10">
                  <span className="font-semibold">{isRtl ? 'إدارة المحادثات المؤرشفة' : 'Manage Archived Chats'}</span>
                  <span className="text-[11px] text-[#8e8e8e]">
                    {archivedConversations.length} {isRtl ? 'محادثة' : 'chats'}
                  </span>
                </div>

                {archivedConversations.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {archivedConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5"
                      >
                        <div className="min-w-0 flex-1 pe-3">
                          <div className="font-semibold truncate text-xs">{conv.title}</div>
                          <div className="text-[10px] text-[#8e8e8e]">
                            {new Date(conv.updatedAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')} · {conv.messages.length} {isRtl ? 'رسائل' : 'messages'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onUnarchiveConv && (
                            <button
                              onClick={() => onUnarchiveConv(conv.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
                              title={isRtl ? 'فك الأرشفة واسترجاع' : 'Unarchive chat'}
                            >
                              <RotateCcw size={12} />
                              <span>{isRtl ? 'استرجاع' : 'Unarchive'}</span>
                            </button>
                          )}
                          {onDeleteConv && (
                            <button
                              onClick={() => onDeleteConv(conv.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                              title={isRtl ? 'حذف نهائي' : 'Delete permanently'}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-[#8e8e8e]">
                    {isRtl ? 'لا توجد محادثات مؤرشفة حالياً' : 'No archived conversations'}
                  </div>
                )}
              </div>
            )}

            {/* Personalization Tab */}
            {activeTab === 'personalization' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {isRtl
                      ? 'ما الذي ترغب أن يعرفه SULY عنك لتقديم إجابات أفضل؟'
                      : 'What would you like SULY to know about you to provide better responses?'}
                  </label>
                  <p className="text-[11px] text-[#8e8e8e] mb-2">
                    {isRtl
                      ? 'مثل: مجال عملك، لغات البرمجة المفضلة، أهدافك...'
                      : 'e.g. Your job role, tech stack, interests, location...'}
                  </p>
                  <textarea
                    value={aboutUser}
                    onChange={(e) => setAboutUser(e.target.value)}
                    rows={3}
                    placeholder={isRtl ? 'أنا مهندس برمجيات وأحب الشروحات الموجزة المباشرة...' : 'I am a software engineer focused on web tech...'}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-transparent text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {isRtl
                      ? 'كيف تود أن يستجيب SULY لأسئلتك؟'
                      : 'How would you like SULY to respond?'}
                  </label>
                  <p className="text-[11px] text-[#8e8e8e] mb-2">
                    {isRtl
                      ? 'مثل: أسلوب احترافي، مباشر بدون مقدمات طويلة، استخدام الكود والشرح...'
                      : 'e.g. Formal or casual tone, concise answers, code snippets first...'}
                  </p>
                  <textarea
                    value={responsePref}
                    onChange={(e) => setResponsePref(e.target.value)}
                    rows={3}
                    placeholder={isRtl ? 'إجابات مباشرة مع أمثلة عملية وكود نظيف...' : 'Be concise, objective, and provide clean code examples...'}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-transparent text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveInstructions}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity"
                  >
                    {savedSuccess ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span>{isRtl ? 'تم الحفظ!' : 'Saved!'}</span>
                      </>
                    ) : (
                      <span>{isRtl ? 'حفظ التعليمات' : 'Save Instructions'}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Memory Tab */}
            {activeTab === 'memory' && (
              <div className="space-y-5">
                {/* Memory Master Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                  <div className="pe-4">
                    <div className="font-semibold text-xs flex items-center gap-2">
                      <Brain size={15} className="text-purple-400" />
                      <span>{isRtl ? 'تفعيل الذاكرة (Memory)' : 'Enable Memory'}</span>
                    </div>
                    <div className="text-[11px] text-[#8e8e8e] mt-0.5">
                      {isRtl
                        ? 'يسمح لـ SULY بتذكر التفاصيل والتفضيلات المهمة عبر كافة المحادثات.'
                        : 'Allows SULY to remember details across chats to provide customized responses.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.memoryEnabled}
                    onChange={(e) => onUpdateSettings({ memoryEnabled: e.target.checked })}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                {/* Add New Memory Manually */}
                <form onSubmit={handleAddMemory} className="flex gap-2">
                  <input
                    type="text"
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder={isRtl ? 'أضف معلومة جديدة ليتذكرها SULY...' : 'Add a detail for SULY to remember...'}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-transparent text-xs focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMemoryText.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    <Plus size={14} />
                    <span>{isRtl ? 'إضافة' : 'Add'}</span>
                  </button>
                </form>

                {/* Memories List */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-white/10 text-xs">
                    <span className="font-semibold">
                      {isRtl ? 'الذكريات المحفوظة' : 'Saved Memories'} ({settings.memories?.length || 0})
                    </span>
                    {settings.memories && settings.memories.length > 0 && (
                      <button
                        onClick={handleClearAllMemories}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        {isRtl ? 'مسح كافة الذكريات' : 'Clear all'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                    {settings.memories && settings.memories.length > 0 ? (
                      settings.memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="flex items-start justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-purple-400/40 transition-colors group"
                        >
                          <div className="min-w-0 flex-1 pe-3">
                            <p className="text-xs text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                              {mem.content}
                            </p>
                            <span className="text-[10px] text-[#8e8e8e]">
                              {new Date(mem.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="p-1 rounded text-[#8e8e8e] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title={isRtl ? 'حذف هذه الذكرى' : 'Delete memory'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-[#8e8e8e]">
                        {isRtl ? 'لا توجد ذكريات محفوظة حالياً' : 'No memories saved yet'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Speech Tab */}
            {activeTab === 'speech' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    {isRtl ? 'صوت المساعد (Voice)' : 'Voice Voice'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Juniper', 'Breeze', 'Cove', 'Ember', 'Sky'].map((v) => (
                      <button
                        key={v}
                        onClick={() => onUpdateSettings({ voice: v as any })}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs text-start transition-colors ${
                          settings.voice === v
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                            : 'border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{v}</span>
                        {settings.voice === v && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-white/10">
                  <div>
                    <div className="font-semibold">{isRtl ? 'التأثيرات الصوتية' : 'Sound Effects'}</div>
                    <div className="text-[11px] text-[#8e8e8e]">
                      {isRtl ? 'تشغيل أصوات لطيفة عند الإرسال والاستلام' : 'Play subtle chime sounds'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Data Controls Tab */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{isRtl ? 'تصدير البيانات' : 'Export Data'}</div>
                    <div className="text-[11px] text-[#8e8e8e]">
                      {isRtl ? 'تنزيل جميع المحادثات كملف JSON' : 'Download all conversations as JSON file'}
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors"
                  >
                    <Download size={14} />
                    <span>{isRtl ? 'تصدير' : 'Export'}</span>
                  </button>
                </div>

                <div className="h-px bg-neutral-200 dark:bg-white/10 my-2" />

                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-[11px] text-[#8e8e8e] leading-relaxed">
                  {isRtl
                    ? 'يتم تخزين جميع المحادثات والإعدادات محلياً في متصفحك بشكل آمن وخاص.'
                    : 'All chat conversations and settings are stored locally on your device for fast access and privacy.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

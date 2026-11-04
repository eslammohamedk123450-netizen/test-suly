import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  SquarePen,
  Search,
  Compass,
  Pin,
  Pencil,
  Trash2,
  Share2,
  Archive,
  MoreHorizontal,
  Settings,
  Sliders,
  LogOut,
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Conversation, UserProfile, AppSettings } from '../types';
import { groupConversations } from '../utils/storage';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConv: (id: string) => void;
  onNewChat: () => void;
  onDeleteConv: (id: string) => void;
  onRenameConv: (id: string, newTitle: string) => void;
  onPinConv: (id: string) => void;
  onArchiveConv: (id: string) => void;
  onOpenSettings: (tab?: string) => void;
  onOpenSearch: () => void;
  onShareConv: (id: string) => void;
  userProfile: UserProfile;
  settings: AppSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onSelectConv,
  onNewChat,
  onDeleteConv,
  onRenameConv,
  onPinConv,
  onArchiveConv,
  onOpenSettings,
  onOpenSearch,
  onShareConv,
  userProfile,
  settings,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isRtl = settings.language === 'ar';
  const grouped = groupConversations(conversations);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConv(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const renderConvItem = (conv: Conversation) => {
    const isActive = conv.id === activeId;
    const isEditing = conv.id === editingId;

    return (
      <div
        key={conv.id}
        className={`group relative flex items-center h-9 px-2.5 rounded-lg text-sm transition-colors cursor-pointer select-none ${
          isActive
            ? 'bg-[#ececec] dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] font-medium'
            : 'text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#f0f0f0] dark:hover:bg-[#212121]/70 hover:text-[#0d0d0d] dark:hover:text-[#ececec]'
        }`}
        onClick={() => {
          if (!isEditing) onSelectConv(conv.id);
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => handleSaveRename(conv.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(conv.id);
              if (e.key === 'Escape') setEditingId(null);
            }}
            autoFocus
            className="w-full bg-transparent border-b border-emerald-500 text-sm focus:outline-none px-1 text-inherit"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2 w-full min-w-0 pr-6">
            {conv.isPinned && <Pin size={12} className="shrink-0 text-emerald-500 fill-emerald-500/20" />}
            <span className="truncate w-full text-start text-[13.5px]">{conv.title}</span>
          </div>
        )}

        {/* 3-dots action menu trigger */}
        {!isEditing && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
              }}
              className="p-1 rounded-md text-[#8e8e8e] hover:text-[#ececec] hover:bg-[#2a2a2a] transition-colors"
              title={isRtl ? 'المزيد من الخيارات' : 'More options'}
            >
              <MoreHorizontal size={14} />
            </button>

            {/* Menu Popover */}
            {menuOpenId === conv.id && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-44 z-50 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-xl py-1 text-xs text-[#0d0d0d] dark:text-[#ececec]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onShareConv(conv.id);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors text-start"
                >
                  <Share2 size={13} />
                  <span>{isRtl ? 'مشاركة' : 'Share'}</span>
                </button>
                <button
                  onClick={() => handleStartRename(conv)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors text-start"
                >
                  <Pencil size={13} />
                  <span>{isRtl ? 'إعادة تسمية' : 'Rename'}</span>
                </button>
                <button
                  onClick={() => {
                    onPinConv(conv.id);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors text-start"
                >
                  <Pin size={13} />
                  <span>{conv.isPinned ? (isRtl ? 'إلغاء التثبيت' : 'Unpin') : isRtl ? 'تثبيت' : 'Pin'}</span>
                </button>
                <button
                  onClick={() => {
                    onArchiveConv(conv.id);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors text-start"
                >
                  <Archive size={13} />
                  <span>{isRtl ? 'أرشفة' : 'Archive'}</span>
                </button>
                <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
                <button
                  onClick={() => {
                    onDeleteConv(conv.id);
                    setMenuOpenId(null);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-red-500/10 text-red-500 transition-colors text-start"
                >
                  <Trash2 size={13} />
                  <span>{isRtl ? 'حذف المحادثة' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 start-0 z-40 flex flex-col w-[260px] bg-[#f9f9f9] dark:bg-[#171717] border-e border-[#e5e5e5] dark:border-white/5 transition-transform duration-250 ease-in-out ${
          isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full md:-mr-[260px] md:translate-x-0' : '-translate-x-full md:-ml-[260px] md:translate-x-0'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top Header Buttons */}
        <div className="flex items-center justify-between p-2.5">
          {/* Collapse sidebar button */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#212121] transition-colors"
            title={isRtl ? 'إغلاق القائمة الجانبية (Ctrl+Shift+S)' : 'Close sidebar (Ctrl+Shift+S)'}
          >
            <PanelLeftClose size={19} />
          </button>

          <div className="flex items-center gap-1">
            {/* Search Chats */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#212121] transition-colors"
              title={isRtl ? 'البحث في المحادثات' : 'Search chats'}
            >
              <Search size={18} />
            </button>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#212121] transition-colors"
              title={isRtl ? 'محادثة جديدة' : 'New chat'}
            >
              <SquarePen size={18} />
            </button>
          </div>
        </div>

        {/* Shortcuts / Navigation */}
        <div className="px-2 py-1 space-y-0.5">
          <button
            onClick={onNewChat}
            className="flex items-center gap-3 w-full h-10 px-2.5 rounded-lg text-sm text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#ececec] dark:hover:bg-[#212121] transition-colors font-medium text-start"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-emerald-500">
              <Sparkles size={16} />
            </div>
            <span>ChatGPT</span>
          </button>

          <button
            onClick={() => onOpenSettings('models')}
            className="flex items-center gap-3 w-full h-9 px-2.5 rounded-lg text-sm text-[#5d5d5d] dark:text-[#b4b4b4] hover:bg-[#ececec] dark:hover:bg-[#212121] hover:text-[#0d0d0d] dark:hover:text-[#ececec] transition-colors text-start"
          >
            <Compass size={17} className="text-[#8e8e8e]" />
            <span>{isRtl ? 'استكشف النماذج والمساعدين' : 'Explore GPTs'}</span>
          </button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {/* Pinned */}
          {grouped.pinned.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#8e8e8e] uppercase">
                {isRtl ? 'المثبتة' : 'Pinned'}
              </div>
              <div className="space-y-0.5">{grouped.pinned.map(renderConvItem)}</div>
            </div>
          )}

          {/* Today */}
          {grouped.today.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#8e8e8e] uppercase">
                {isRtl ? 'اليوم' : 'Today'}
              </div>
              <div className="space-y-0.5">{grouped.today.map(renderConvItem)}</div>
            </div>
          )}

          {/* Yesterday */}
          {grouped.yesterday.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#8e8e8e] uppercase">
                {isRtl ? 'أمس' : 'Yesterday'}
              </div>
              <div className="space-y-0.5">{grouped.yesterday.map(renderConvItem)}</div>
            </div>
          )}

          {/* Previous 7 Days */}
          {grouped.previous7Days.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#8e8e8e] uppercase">
                {isRtl ? 'آخر 7 أيام' : 'Previous 7 Days'}
              </div>
              <div className="space-y-0.5">{grouped.previous7Days.map(renderConvItem)}</div>
            </div>
          )}

          {/* Previous 30 Days */}
          {grouped.previous30Days.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#8e8e8e] uppercase">
                {isRtl ? 'آخر 30 يوماً' : 'Previous 30 Days'}
              </div>
              <div className="space-y-0.5">{grouped.previous30Days.map(renderConvItem)}</div>
            </div>
          )}

          {/* Older */}
          {grouped.older.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#8e8e8e] uppercase">
                {isRtl ? 'السابقة' : 'Older'}
              </div>
              <div className="space-y-0.5">{grouped.older.map(renderConvItem)}</div>
            </div>
          )}

          {conversations.length === 0 && (
            <div className="text-center py-8 text-xs text-[#8e8e8e]">
              {isRtl ? 'لا توجد محادثات سابقة' : 'No previous conversations'}
            </div>
          )}
        </div>

        {/* Upgrade Plan Banner */}
        <div className="p-2 border-t border-[#e5e5e5] dark:border-white/5">
          <div
            onClick={() => onOpenSettings('general')}
            className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                {isRtl ? 'ترقية الخطة' : 'Upgrade Plan'}
              </div>
              <div className="text-[11px] text-[#8e8e8e] truncate">
                {isRtl ? 'وصول أسرع وميزات ذكاء متقدمة' : 'Get faster responses & more'}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="relative p-2 border-t border-[#e5e5e5] dark:border-white/5">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[#ececec] dark:hover:bg-[#212121] transition-colors text-start"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userProfile.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[#0d0d0d] dark:text-[#ececec] truncate">
                {userProfile.name}
              </div>
              <div className="text-[11px] text-[#8e8e8e] flex items-center gap-1.5">
                <span>{userProfile.plan}</span>
                <span>·</span>
                <span className="truncate">{userProfile.email}</span>
              </div>
            </div>
          </button>

          {/* Profile Menu Popover */}
          {profileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute bottom-full start-2 mb-2 w-64 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700/80 rounded-2xl shadow-2xl py-1.5 text-xs text-[#0d0d0d] dark:text-[#ececec] z-50"
            >
              <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700/60">
                <div className="font-semibold text-sm">{userProfile.name}</div>
                <div className="text-[#8e8e8e] text-[11px] truncate">{userProfile.email}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onOpenSettings('personalization');
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors text-start"
                >
                  <Sliders size={15} className="text-[#8e8e8e]" />
                  <span>{isRtl ? 'تخصيص ChatGPT' : 'Customize ChatGPT'}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings('general');
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors text-start"
                >
                  <Settings size={15} className="text-[#8e8e8e]" />
                  <span>{isRtl ? 'الإعدادات والمظهر' : 'Settings'}</span>
                </button>
              </div>

              <div className="h-px bg-neutral-200 dark:bg-neutral-700/60 my-1" />

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onNewChat();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] text-red-500 transition-colors text-start"
              >
                <LogOut size={15} />
                <span>{isRtl ? 'تسجيل الخروج' : 'Log out'}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

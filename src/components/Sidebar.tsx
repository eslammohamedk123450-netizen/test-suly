import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  FolderGit2,
  ShieldCheck,
  ChevronLeft,
  X,
  ExternalLink,
} from 'lucide-react';
import { Conversation, Project } from '../types';
import { soundController } from '../utils/audio';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenProjectsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenProjectsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 right-0 z-50 w-72 bg-[#0a0c10] border-l border-[#1f2430] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: New Chat button & close for mobile */}
        <div className="p-4 border-b border-[#1f2430] flex items-center gap-2">
          <button
            onClick={() => {
              onNewConversation();
              soundController.playClick();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#07080a] font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-[#d4af37]/20 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>محادثة جديدة</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-[#181c25]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحادثات..."
              className="w-full bg-[#13161f] border border-[#232938] rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Projects Quick Selector */}
        <div className="px-4 py-2.5 border-b border-[#181c25] bg-[#0d0f14]/50">
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
            <div className="flex items-center gap-1">
              <FolderGit2 className="w-3 h-3 text-[#d4af37]" />
              <span>مساحة المشروع</span>
            </div>
            <button
              onClick={onOpenProjectsModal}
              className="text-[#f3e5ab] hover:underline"
            >
              إدارة
            </button>
          </div>
          <select
            value={activeProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="w-full bg-[#13161f] text-stone-200 text-xs rounded-lg border border-[#232938] px-2 py-1 focus:outline-none focus:border-[#d4af37]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs">
              {searchQuery ? 'لم يتم العثور على محادثات مطابقة.' : 'لا توجد محادثات سابقة بعد.'}
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectConversation(c.id);
                    soundController.playClick();
                  }}
                  className={`group relative p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#181c26] text-white border border-[#d4af37]/40 shadow-sm'
                      : 'text-stone-300 hover:bg-[#13161f] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isActive ? 'text-[#d4af37]' : 'text-stone-500 group-hover:text-stone-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{c.title || 'محادثة جديدة'}</div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {c.messages.length} رسالة • {new Date(c.updatedAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(c.id);
                      soundController.playClick();
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-stone-500 hover:text-rose-400 transition-all"
                    title="حذف المحادثة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User VIP Profile Footer */}
        <div className="p-3 border-t border-[#1f2430] bg-[#08090d]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#0f121a] border border-[#1f2430]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#aa7c11] text-[#07080a] flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-200 flex items-center gap-1">
                  <span>عضوية VIP</span>
                  <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
                </div>
                <div className="text-[10px] text-stone-500 truncate">سحابي دائم • متصل</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
};

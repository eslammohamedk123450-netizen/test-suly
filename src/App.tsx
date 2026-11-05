import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { VoiceModeModal } from './components/VoiceModeModal';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { SearchModal } from './components/SearchModal';
import { GptsStoreModal } from './components/GptsStoreModal';
import {
  Conversation,
  Message,
  ModelOption,
  AppSettings,
  UserProfile,
  Attachment,
  CustomGpt,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadCurrentConvId,
  saveCurrentConvId,
  loadSettings,
  saveSettings,
  loadProfile,
  saveProfile,
} from './utils/storage';

const DEFAULT_MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Our most intelligent and versatile model for coding, writing, and deep analysis.',
    tag: 'Flagship',
    icon: 'sparkle',
    capabilities: ['Web browsing', 'DALL·E Image generation', 'Code execution', 'File analysis'],
  },
  {
    id: 'o1',
    name: 'o1',
    description: 'Reasoning model designed to solve hard problems in STEM, logic, and architecture.',
    tag: 'Reasoning',
    icon: 'brain',
    capabilities: ['Step-by-step thinking', 'Deep math & science', 'Architecture design'],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    description: 'Fast, lightweight model for fast answers and routine everyday tasks.',
    tag: 'Fast',
    icon: 'zap',
    capabilities: ['Instant answers', 'Lightweight tasks', 'High speed'],
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    description: 'Fast STEM-focused reasoning model with low latency and precise logic.',
    tag: 'STEM Reasoning',
    icon: 'cpu',
    capabilities: ['Rapid math', 'Algorithm optimization', 'Deep logic'],
  },
];

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [currentConvId, setCurrentConvId] = useState<string | null>(() => {
    const saved = loadCurrentConvId();
    const convs = loadConversations();
    if (saved && convs.some((c) => c.id === saved)) return saved;
    return convs[0]?.id || null;
  });

  const [models, setModels] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTemporary, setIsTemporary] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  // Modal states
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('general');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGptsStoreOpen, setIsGptsStoreOpen] = useState(false);

  // Streaming & Abort controller
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRtl = settings.language === 'ar';

  // Apply theme to html root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
  }, [settings.theme]);

  // Apply direction to document
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'ar' : 'en';
  }, [isRtl]);

  // Save conversations to localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Save active conversation ID
  useEffect(() => {
    saveCurrentConvId(currentConvId);
  }, [currentConvId]);

  // Save settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Fetch models from backend if available
  useEffect(() => {
    fetch('/api/models')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.models && Array.isArray(data.models)) {
          setModels(data.models);
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut Ctrl+Shift+S for sidebar and Ctrl+Shift+O for new chat
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Auto-scroll on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isGenerating]);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === currentConvId) || null;

  // New Chat handler
  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentConvId(null);
  };

  // Select conversation handler
  const handleSelectConv = (id: string) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentConvId(id);
  };

  // Delete conversation handler
  const handleDeleteConv = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConvId === id) {
      setCurrentConvId(null);
    }
  };

  // Rename conversation handler
  const handleRenameConv = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Pin/Unpin conversation
  const handlePinConv = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c))
    );
  };

  // Archive conversation
  const handleArchiveConv = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true, updatedAt: Date.now() } : c))
    );
    if (currentConvId === id) {
      setCurrentConvId(null);
    }
  };

  // Unarchive conversation
  const handleUnarchiveConv = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: false, updatedAt: Date.now() } : c))
    );
  };

  // Select custom GPT from store
  const handleSelectGpt = (gpt: CustomGpt, initialPrompt?: string) => {
    const newConv: Conversation = {
      id: 'conv-' + Math.random().toString(36).substring(2, 9),
      title: `${gpt.avatar} ${gpt.name}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: 'gpt-4o',
      customGptId: gpt.id,
      messages: [
        {
          id: 'msg-' + Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: isRtl
            ? `مرحبًا! أنا **${gpt.name}**.\n\n${gpt.description}\n\nجاهز لمساعدتك فورًا، كيف يمكننا البدء؟`
            : `Hello! I am **${gpt.name}**.\n\n${gpt.description}\n\nHow can I help you today?`,
          createdAt: Date.now(),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newConv.id);

    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 150);
    }
  };

  // Clear all chats
  const handleClearAllChats = () => {
    setConversations([]);
    setCurrentConvId(null);
  };

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send message and stream response
  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = [],
    webSearch = false,
    reasoning = false
  ) => {
    if ((!text.trim() && attachments.length === 0) || isGenerating) return;

    let convId = currentConvId;
    let targetConv = conversations.find((c) => c.id === convId);

    const userMessage: Message = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text,
      createdAt: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMsgId = 'msg-' + Math.random().toString(36).substring(2, 9);
    const placeholderAssistant: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      isStreaming: true,
      modelUsed: selectedModel,
    };

    // If no existing conversation or creating new one
    if (!targetConv || !convId) {
      const newTitle = text.slice(0, 32) || (isRtl ? 'محادثة جديدة' : 'New chat');
      const newConv: Conversation = {
        id: 'conv-' + Math.random().toString(36).substring(2, 9),
        title: newTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
        messages: [userMessage, placeholderAssistant],
      };

      if (!isTemporary) {
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConvId(newConv.id);
      }
      convId = newConv.id;
      targetConv = newConv;
    } else {
      // Append user message and placeholder assistant to existing conversation
      const updatedMessages = [...targetConv.messages, userMessage, placeholderAssistant];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: updatedMessages, updatedAt: Date.now() } : c
        )
      );
    }

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyToSend = targetConv.messages
        .filter((m) => !m.isStreaming)
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          model: selectedModel,
          webSearch,
          reasoning,
          customInstructions: `${settings.customInstructions.aboutUser}\n${settings.customInstructions.responsePreferences}`.trim(),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server returned ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantText = '';
      let thoughtsText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'content' && parsed.text) {
                assistantText += parsed.text;
                // Live update assistant message
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, content: assistantText, thoughts: thoughtsText || undefined }
                          : m
                      ),
                    };
                  })
                );
              } else if (parsed.type === 'thought' && parsed.text) {
                thoughtsText += parsed.text;
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId ? { ...m, thoughts: thoughtsText } : m
                      ),
                    };
                  })
                );
              } else if (parsed.type === 'image' && parsed.url) {
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId ? { ...m, generatedImageUrl: parsed.url } : m
                      ),
                    };
                  })
                );
              } else if (parsed.type === 'metrics') {
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, metrics: { tokenCount: parsed.tokens, durationMs: parsed.durationMs } }
                          : m
                      ),
                    };
                  })
                );
              } else if (parsed.type === 'done') {
                // Done
              }
            } catch (err) {
              console.error('Error parsing SSE chunk:', err);
            }
          }
        }
      }

      // Mark streaming as complete
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errMsg = err.message || 'حدث خطأ في جلب الرد';
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      isStreaming: false,
                      content:
                        m.content ||
                        (isRtl
                          ? '⚠️ تعذر إكمال الرد، يرجى المحاولة مرة أخرى أو التحقق من الإعدادات.'
                          : '⚠️ Unable to complete response, please retry or check settings.'),
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!currentConversation || isGenerating) return;
    const msgs = currentConversation.messages;
    const lastUserIdx = msgs.map((m) => m.role).lastIndexOf('user');
    if (lastUserIdx === -1) return;

    const lastUserMsg = msgs[lastUserIdx];
    // Trim conversation up to the user message
    const trimmed = msgs.slice(0, lastUserIdx);
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversation.id ? { ...c, messages: trimmed } : c))
    );

    handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
  };

  // Edit user message and re-run
  const handleEditUserMessage = (msgId: string, newContent: string) => {
    if (!currentConversation || isGenerating) return;
    const msgs = currentConversation.messages;
    const idx = msgs.findIndex((m) => m.id === msgId);
    if (idx === -1) return;

    // Remove this message and all following, then send new content
    const trimmed = msgs.slice(0, idx);
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversation.id ? { ...c, messages: trimmed } : c))
    );

    handleSendMessage(newContent);
  };

  // Voice mode interaction handler
  const handleVoiceQuery = async (query: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          model: selectedModel,
        }),
      });
      // In voice mode, we read full stream into text
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'content' && parsed.text) text += parsed.text;
              } catch {}
            }
          }
        }
      }
      return text || (isRtl ? 'أهلاً بك، كيف يمكنني مساعدتك اليوم؟' : 'Hello! How can I help you?');
    } catch {
      return isRtl ? 'عذراً، حدث خطأ أثناء المعالجة.' : 'Sorry, an error occurred.';
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] font-sans transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ChatGPT Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={currentConvId}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectConv={handleSelectConv}
        onNewChat={handleNewChat}
        onDeleteConv={handleDeleteConv}
        onRenameConv={handleRenameConv}
        onPinConv={handlePinConv}
        onArchiveConv={handleArchiveConv}
        onOpenSettings={(tab) => {
          setSettingsTab(tab || 'general');
          setIsSettingsOpen(true);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGptsStore={() => setIsGptsStoreOpen(true)}
        onShareConv={(id) => {
          setCurrentConvId(id);
          setIsShareOpen(true);
        }}
        userProfile={profile}
        settings={settings}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          models={models}
          isTemporary={isTemporary}
          onToggleTemporary={() => setIsTemporary(!isTemporary)}
          onShare={() => setIsShareOpen(true)}
          onOpenVoiceMode={() => setIsVoiceOpen(true)}
          settings={settings}
          onUpdateSettings={(newSt) => setSettings((prev) => ({ ...prev, ...newSt }))}
        />

        {/* Central Content Viewport */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(p) => handleSendMessage(p)}
              isRtl={isRtl}
            />
          ) : (
            <div className="flex-1 pb-4">
              {currentConversation.messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLast={idx === currentConversation.messages.length - 1}
                  onRegenerate={handleRegenerate}
                  onEdit={(newText) => handleEditUserMessage(msg.id, newText)}
                  isRtl={isRtl}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Box */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGenerating={handleStopGenerating}
          onOpenVoiceMode={() => setIsVoiceOpen(true)}
          isRtl={isRtl}
        />
      </div>

      {/* Modals */}
      <VoiceModeModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSendVoiceQuery={handleVoiceQuery}
        currentVoice={settings.voice}
        onChangeVoice={(v) => setSettings((prev) => ({ ...prev, voice: v }))}
        isRtl={isRtl}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSt) => setSettings((prev) => ({ ...prev, ...newSt }))}
        conversations={conversations}
        onClearAllChats={handleClearAllChats}
        onUnarchiveConv={handleUnarchiveConv}
        onDeleteConv={handleDeleteConv}
        initialTab={settingsTab}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        conversation={currentConversation}
        isRtl={isRtl}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conversations={conversations}
        onSelectConv={handleSelectConv}
        isRtl={isRtl}
      />

      <GptsStoreModal
        isOpen={isGptsStoreOpen}
        onClose={() => setIsGptsStoreOpen(false)}
        onSelectGpt={handleSelectGpt}
        isRtl={isRtl}
      />
    </div>
  );
}

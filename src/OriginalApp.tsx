import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CanvasPanel } from './components/CanvasPanel';
import { VoiceModeModal } from './components/VoiceModeModal';
import { MemoryModal } from './components/MemoryModal';
import { ProjectModal } from './components/ProjectModal';
import { ExportModal } from './components/ExportModal';
import {
  Conversation,
  Message,
  MemoryItem,
  Project,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveConvId,
  saveActiveConvId,
  loadMemories,
  saveMemories,
  loadProjects,
  saveProjects,
} from './utils/storage';
import { soundController } from './utils/audio';

export default function App() {
  // App State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    if (loaded.length > 0) return loaded;
    const initial: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'محادثة استكشافية مع SULY AI',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    return [initial];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const savedId = loadActiveConvId();
    const loaded = loadConversations();
    if (savedId && loaded.some((c) => c.id === savedId)) return savedId;
    return loaded[0]?.id || `conv-${Date.now()}`;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => loadMemories());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const projs = loadProjects();
    return projs[0]?.id || 'proj-general';
  });

  // UI Modals & Panels
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasCode, setCanvasCode] = useState('');
  const [canvasLanguage, setCanvasLanguage] = useState('javascript');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTargetConversation, setExportTargetConversation] = useState<Conversation | null>(null);

  // Status & Streaming
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => soundController.isEnabled());
  const abortControllerRef = useRef<AbortController | null>(null);

  // PWA Prompt
  const [installPrompt, setInstallPrompt] = useState<(() => void) | null>(null);

  // Register PWA service worker and listen for beforeinstallprompt
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.debug('Service Worker register skipped or offline:', err);
      });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      setInstallPrompt(() => () => {
        promptEvent.prompt();
        promptEvent.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            setInstallPrompt(null);
          }
        });
      });
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Sync to storage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConvId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    saveMemories(memories);
  }, [memories]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  // Create a new conversation
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'محادثة جديدة',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      projectId: activeProjectId,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const fallback: Conversation = {
        id: `conv-${Date.now()}`,
        title: 'محادثة جديدة',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setConversations([fallback]);
      setActiveConversationId(fallback.id);
    } else {
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
    }
  };

  // Send message and stream response from Gemini 3.8 Flash via SSE
  const handleSendMessage = async (userText: string): Promise<string | void> => {
    if (!userText.trim() || isLoading) return;

    const startTime = performance.now();
    const userMsgId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: userText.trim(),
      timestamp: Date.now(),
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
      modelUsed: 'gemini-3.8-flash',
    };

    // Update conversation state with user message and placeholder assistant message
    const updatedMessages = [...activeConversation.messages, userMessage, assistantMessage];
    const isFirstMessage = activeConversation.messages.length === 0;
    const updatedTitle = isFirstMessage
      ? userText.slice(0, 32).trim() + (userText.length > 32 ? '...' : '')
      : activeConversation.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: updatedTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setIsLoading(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Collect memories and project documents context
    const enabledMemories = memories.filter((m) => m.enabled).map((m) => m.text);
    const projectDocsContent = activeProject
      ? activeProject.documents
          .map((d) => `--- ملف: ${d.name} ---\n${d.content.slice(0, 8000)}`)
          .join('\n\n')
      : '';

    let accumulatedContent = '';

    try {
      // Call streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...activeConversation.messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          memories: enabledMemories,
          projectContext: projectDocsContent,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: فشل الاتصال بخادم SULY AI`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let done = false;
        let buffer = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') {
                  done = true;
                  break;
                }

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.error) {
                    accumulatedContent += `\n[تنبيه: ${parsed.error}]`;
                  } else if (parsed.text) {
                    accumulatedContent += parsed.text;
                  }

                  // Update UI with stream delta
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeConversation.id
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMsgId
                                ? { ...m, content: accumulatedContent }
                                : m
                            ),
                          }
                        : c
                    )
                  );
                } catch {
                  // Skip non-json lines
                }
              }
            }
          }
        }
      }

      // Finish streaming
      const latency = Math.round(performance.now() - startTime);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: accumulatedContent || 'تم إنهاء الرد بنجاح.',
                        status: 'complete',
                        latencyMs: latency,
                      }
                    : m
                ),
              }
            : c
        )
      );

      soundController.playComplete();
      return accumulatedContent;
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'AbortError') {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: accumulatedContent + '\n\n*(تم إيقاف التوليد بطلب من المستخدم)*',
                          status: 'complete',
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } else {
        const errorMsg =
          err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء معالجة الرد';
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: `تعذر الاتصال بـ SULY AI: ${errorMsg}. يرجى التحقق من إعدادات المفتاح أو الاتصال.`,
                          status: 'error',
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleOpenInCanvas = (code: string, language: string) => {
    setCanvasCode(code);
    setCanvasLanguage(language);
    setIsCanvasOpen(true);
    soundController.playClick();
  };

  const handleAskSulyToRefine = (refineInstruction: string, existingCode: string) => {
    const prompt = `يرجى تعديل وتحسين الكود التالي وفقاً لهذا التوجيه: "${refineInstruction}"\n\nالكود الحالي:\n\`\`\`${canvasLanguage}\n${existingCode}\n\`\`\``;
    handleSendMessage(prompt);
  };

  const handleExportSingleMessage = (msg: Message) => {
    const singleConv: Conversation = {
      id: `report-${Date.now()}`,
      title: 'تقرير مخصص صادر من SULY AI',
      createdAt: msg.timestamp,
      updatedAt: msg.timestamp,
      messages: [msg],
    };
    setExportTargetConversation(singleConv);
    setIsExportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-stone-100 flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f3e5ab]">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenMemory={() => setIsMemoryModalOpen(true)}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        onOpenExport={() => {
          setExportTargetConversation(activeConversation);
          setIsExportModalOpen(true);
        }}
        onToggleCanvas={() => setIsCanvasOpen(!isCanvasOpen)}
        isCanvasOpen={isCanvasOpen}
        activeMemoriesCount={memories.filter((m) => m.enabled).length}
        activeProjectName={activeProject?.name || 'المشروع العام'}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(soundController.toggle())}
        installPrompt={installPrompt}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <ChatArea
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
          onOpenInCanvas={handleOpenInCanvas}
          onExportMessage={handleExportSingleMessage}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          activeMemories={memories.filter((m) => m.enabled)}
          projectName={activeProject?.name || 'العام'}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setIsSidebarOpen(false);
          }}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => setActiveProjectId(id)}
          onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        />

        {/* Interactive Canvas Panel */}
        <CanvasPanel
          isOpen={isCanvasOpen}
          onClose={() => setIsCanvasOpen(false)}
          initialCode={canvasCode}
          initialLanguage={canvasLanguage}
          onAskSulyToRefine={handleAskSulyToRefine}
        />
      </div>

      {/* Voice Mode Modal with Fluid Visualizer */}
      <VoiceModeModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendMessage={async (query) => {
          const reply = await handleSendMessage(query);
          return reply || undefined;
        }}
      />

      {/* Proactive Cumulative Memory Modal */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={memories}
        onUpdateMemories={(updated) => setMemories(updated)}
      />

      {/* Project Knowledge Base Modal */}
      <ProjectModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onUpdateProjects={(updated) => setProjects(updated)}
      />

      {/* Export Center Modal */}
      {isExportModalOpen && exportTargetConversation && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          conversation={exportTargetConversation}
          onRestoreBackup={(imported) => {
            setConversations(imported);
            if (imported[0]) setActiveConversationId(imported[0].id);
          }}
        />
      )}
    </div>
  );
}

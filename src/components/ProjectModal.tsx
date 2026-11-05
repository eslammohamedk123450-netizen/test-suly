import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  Plus,
  Upload,
  FileText,
  Trash2,
  Check,
  FileCode,
  Layers,
} from 'lucide-react';
import { Project, ProjectDocument } from '../types';
import { soundController } from '../utils/audio';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProjects: (projects: Project[]) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProjects,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedDocContent, setSelectedDocContent] = useState<ProjectDocument | null>(null);

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'مشروع مخصص داخل منصة SULY AI',
      documents: [],
      createdAt: Date.now(),
    };

    onUpdateProjects([...projects, newProj]);
    onSelectProject(newProj.id);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreatingProject(false);
    soundController.playComplete();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentProject) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const doc: ProjectDocument = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            type: file.type || file.name.split('.').pop() || 'text',
            content: text,
            size: file.size,
            uploadedAt: Date.now(),
          };

          const updatedProjects = projects.map((p) => {
            if (p.id === currentProject.id) {
              return { ...p, documents: [...p.documents, doc] };
            }
            return p;
          });

          onUpdateProjects(updatedProjects);
          soundController.playComplete();
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          documents: p.documents.filter((d) => d.id !== docId),
        };
      }
      return p;
    });
    onUpdateProjects(updatedProjects);
    if (selectedDocContent?.id === docId) setSelectedDocContent(null);
    soundController.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080a]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0d0f14] border border-[#d4af37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#13161f] border-b border-[#1f2430] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">قاعدة المعرفة والمشاريع (Project Knowledge)</h2>
              <p className="text-[11px] text-stone-400">
                أرفق ملفات مشروعك أو شركتك ليبقى SULY AI مطلعاً على تفاصيلها في كل إجابة
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

        {/* Content Body: Split Left (Projects list) & Right (Project Files) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#1f2430]">
          {/* Projects Column */}
          <div className="p-4 bg-[#0a0c10] flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300">مشاريعك</span>
              <button
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="p-1 rounded bg-[#181c25] hover:bg-[#232938] text-[#d4af37] text-xs flex items-center gap-1"
                title="مشروع جديد"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>جديد</span>
              </button>
            </div>

            {isCreatingProject && (
              <form onSubmit={handleCreateProject} className="p-3 rounded-xl bg-[#13161f] border border-[#232938] space-y-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="اسم المشروع..."
                  className="w-full bg-[#0a0c10] border border-[#222736] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
                  required
                />
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="وصف مختصر للمشروع..."
                  className="w-full bg-[#0a0c10] border border-[#222736] rounded-lg px-2.5 py-1.5 text-xs text-stone-300 placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(false)}
                    className="px-2.5 py-1 rounded text-xs text-stone-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-[#d4af37] text-[#07080a] text-xs font-bold"
                  >
                    إنشاء
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1.5">
              {projects.map((proj) => {
                const isActive = proj.id === activeProjectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      soundController.playClick();
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#181c26] border-[#d4af37] text-white shadow-sm'
                        : 'bg-[#0d0f14] border-[#1f2430] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{proj.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#d4af37]" />}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 flex items-center justify-between">
                      <span>{proj.documents.length} مستند</span>
                      <span>{new Date(proj.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Project Documents Column */}
          <div className="md:col-span-2 p-4 bg-[#0d0f14] flex flex-col gap-4 overflow-y-auto">
            {currentProject ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2430]">
                  <div>
                    <h3 className="font-bold text-sm text-white">{currentProject.name}</h3>
                    <p className="text-xs text-stone-400">{currentProject.description}</p>
                  </div>

                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#07080a] font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-[#d4af37]/20 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع ملفات للمشروع</span>
                    <input
                      type="file"
                      multiple
                      accept=".txt,.md,.js,.ts,.py,.json,.csv,.html,.css"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Documents List */}
                <div className="space-y-2 flex-1">
                  {currentProject.documents.length === 0 ? (
                    <div className="border border-dashed border-[#232938] rounded-2xl p-8 text-center text-stone-500 text-xs flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-stone-600" />
                      <span>لا توجد ملفات مرفوعة في هذا المشروع بعد.</span>
                      <span className="text-[11px] text-stone-600">
                        يدعم ملفات .txt, .md, .py, .js, .json, .csv لربطها بذاكرة SULY AI
                      </span>
                    </div>
                  ) : (
                    currentProject.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-[#13161f] border border-[#222736] flex items-center justify-between hover:border-[#d4af37]/40 transition-colors"
                      >
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedDocContent(doc)}
                        >
                          <FileCode className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-xs text-stone-200 truncate">{doc.name}</div>
                            <div className="text-[10px] text-stone-500">
                              {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleTimeString('ar-EG')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedDocContent(doc)}
                            className="px-2.5 py-1 rounded bg-[#181c25] hover:bg-[#232938] text-xs text-[#f3e5ab]"
                          >
                            معاينة
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Document preview modal overlay if opened */}
                {selectedDocContent && (
                  <div className="p-3 rounded-xl bg-[#080a0d] border border-[#232938] text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#181c25] mb-2">
                      <span className="font-bold text-stone-300 font-mono">{selectedDocContent.name}</span>
                      <button
                        onClick={() => setSelectedDocContent(null)}
                        className="text-stone-400 hover:text-white"
                      >
                        إغلاق المعاينة
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-stone-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed" dir="ltr">
                      {selectedDocContent.content.slice(0, 3000)}
                      {selectedDocContent.content.length > 3000 && '\n... [تم اقتطاع المعاينة للكبر]'}
                    </pre>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0c10] border-t border-[#181c25] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-stone-300">
            <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>المشروع النشط يتزامن تلقائياً مع محادثات SULY AI الحالية</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181c25] text-stone-200 hover:bg-[#232938] transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};

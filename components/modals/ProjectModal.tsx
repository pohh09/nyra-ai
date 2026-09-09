'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus,
  X,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  FileText,
  Layers,
  Paperclip,
  Upload,
  Loader2,
  FileCode,
} from 'lucide-react';
import { WorkspaceProject, FileAttachment } from '@/lib/types';
import { extractPdfText } from '@/lib/extractPdfText';
import { useToast } from '@/components/ui/Toast';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WorkspaceProject[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (project: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProject: (id: string, updates: Partial<WorkspaceProject>) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectModal({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectModalProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setName('');
    setDescription('');
    setInstructions('');
    setNotes('');
    setFiles([]);
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (p: WorkspaceProject) => {
    setName(p.name);
    setDescription(p.description);
    setInstructions(p.instructions);
    setNotes(p.notes || '');
    setFiles(p.files || []);
    setEditingId(p.id);
    setIsCreating(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    setIsProcessingFile(true);

    try {
      const newAttachments: FileAttachment[] = [];

      for (const file of uploadedFiles) {
        const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

        if (isPdf) {
          try {
            const { text, pages } = await extractPdfText(file);
            newAttachments.push({
              id: `wfile_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              type: 'pdf',
              size: file.size,
              pages,
              extractedText: text,
              status: 'ready',
            });
            addToast({ type: 'success', title: `Attached ${file.name} (${pages} pages)` });
          } catch (err: any) {
            console.error('Workspace PDF extraction failed:', err);
            addToast({ type: 'error', title: `Failed to read ${file.name}: ${err.message}` });
          }
        } else {
          // Plain text / markdown file
          const text = await file.text();
          newAttachments.push({
            id: `wfile_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: 'text',
            size: file.size,
            extractedText: text,
            status: 'ready',
          });
          addToast({ type: 'success', title: `Attached ${file.name}` });
        }
      }

      setFiles((prev) => [...prev, ...newAttachments]);
    } catch (err: any) {
      console.error('File upload error:', err);
      addToast({ type: 'error', title: 'File upload failed' });
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    addToast({ type: 'info', title: 'File removed from workspace' });
  };

  const handleSave = () => {
    if (!name.trim()) {
      addToast({ type: 'error', title: 'Please enter a project name' });
      return;
    }

    if (editingId) {
      onUpdateProject(editingId, {
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        notes: notes.trim(),
        files,
        updatedAt: Date.now(),
      });
      addToast({ type: 'success', title: 'Workspace updated' });
    } else {
      onCreateProject({
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        notes: notes.trim(),
        files,
      });
      addToast({ type: 'success', title: 'Workspace created' });
    }

    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md text-[#292633] dark:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="w-full max-w-2xl max-h-[88dvh] rounded-3xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24] p-4 sm:p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E4EF] dark:border-purple-400/15 pb-3 sm:pb-4 mb-3 sm:mb-4 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#EEE8FA] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/30 flex items-center justify-center text-[#8B6FC9] dark:text-purple-400 shadow-sm shrink-0">
                <Layers size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#292633] dark:text-white flex items-center gap-1.5 sm:gap-2 truncate">
                  <span>Workspaces</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#EEE8FA] dark:bg-purple-500/20 border border-[#E8E4EF] dark:border-purple-500/30 text-[#8B6FC9] dark:text-purple-300 font-mono shrink-0">
                    {projects.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[#686477] dark:text-slate-400 truncate">Organize conversations & context</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {!isCreating && (
                <button
                  onClick={handleStartCreate}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#EEE8FA] hover:bg-[#E8E4EF] dark:bg-purple-500/20 dark:hover:bg-purple-500/30 border border-[#E8E4EF] dark:border-purple-400/30 text-[#8B6FC9] dark:text-purple-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FolderPlus size={14} className="text-[#8B6FC9] dark:text-purple-300" />
                  <span className="hidden sm:inline">New Workspace</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#EEE8FA] dark:hover:bg-white/10 text-[#686477] hover:text-[#292633] dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form View */}
          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin"
            >
              <div>
                <label className="block text-xs font-semibold text-[#8B6FC9] dark:text-purple-300 mb-1.5">Workspace Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Job Search & Career, React 19 Migration, Research Paper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#090614] border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686477] dark:text-slate-300 mb-1.5">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Targeted resumes, job descriptions, and interview prep"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#090614] border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition"
                />
              </div>

              {/* Workspace Documents & Files */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#8B6FC9] dark:text-purple-300 flex items-center gap-1.5">
                    <Paperclip size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                    <span>Workspace Documents & Files</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFile}
                    className="text-[11px] font-semibold text-[#8B6FC9] dark:text-purple-400 hover:text-[#795BB8] dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingFile ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        <span>Parsing...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={11} />
                        <span>+ Attach PDF / Document</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf,.txt,.md"
                    multiple
                    hidden
                    onChange={handleFileUpload}
                  />
                </div>
                <p className="text-[11px] text-[#686477] dark:text-slate-400 mb-2">
                  Files attached here (e.g. Resume.pdf, Guidelines.pdf) are automatically available to all chats inside this workspace.
                </p>

                {files.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-2xl border border-dashed border-[#E8E4EF] dark:border-purple-400/25 bg-[#F5F3F9] dark:bg-[#090614]/60 hover:bg-[#EEE8FA]/50 dark:hover:bg-[#090614] text-center text-xs text-[#686477] dark:text-slate-400 cursor-pointer transition"
                  >
                    <Upload size={18} className="mx-auto text-[#8B6FC9] dark:text-purple-400/70 mb-1" />
                    <span>Click to attach workspace documents (PDFs, Notes)</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-xl border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF] dark:bg-[#090614] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {file.type === 'pdf' ? (
                            <FileText size={14} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />
                          ) : (
                            <FileCode size={14} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />
                          )}
                          <span className="text-xs font-medium text-[#292633] dark:text-slate-200 truncate">{file.name}</span>
                          {file.pages && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EEE8FA] dark:bg-purple-500/15 text-[#8B6FC9] dark:text-purple-300 font-mono">
                              {file.pages} {file.pages === 1 ? 'page' : 'pages'}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1 rounded-lg text-[#686477] hover:text-[#C77B7B] hover:bg-[#F9ECEC] dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Workspace Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#8B6FC9] dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                  <span>Custom AI Workspace Instructions</span>
                </label>
                <p className="text-[11px] text-[#686477] dark:text-slate-400 mb-2">
                  Nyra will automatically follow these instructions for every conversation inside this workspace.
                </p>
                <textarea
                  rows={4}
                  placeholder="e.g. Help me target Senior Full Stack Engineer roles. Emphasize React, Next.js, and TypeScript in all tailored resumes and answers."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#090614] border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686477] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} className="text-[#686477] dark:text-slate-400" />
                  <span>Workspace Notes & Objectives</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Add quick notes, job links, or key milestones here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F3F9] dark:bg-[#090614] border border-[#E8E4EF] dark:border-purple-400/25 text-xs text-[#292633] dark:text-white placeholder-[#92909B] dark:placeholder-slate-500 outline-none focus:border-[#8B6FC9] transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E8E4EF] dark:border-purple-400/15">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold shadow-md shadow-[#8B6FC9]/20 transition cursor-pointer"
                >
                  {editingId ? 'Update Workspace' : 'Create Workspace'}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Project List View */
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {/* Default Global Workspace Option */}
              <div
                onClick={() => {
                  onSelectProject(null);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  activeProjectId === null
                    ? 'border-[#8B6FC9]/60 bg-[#EEE8FA] dark:bg-purple-500/15 shadow-sm'
                    : 'border-[#E8E4EF] dark:border-white/[0.08] bg-[#F5F3F9] dark:bg-[#090614] hover:border-[#8B6FC9]/40 hover:bg-[#EEE8FA]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#E8E4EF] dark:border-white/10 flex items-center justify-center text-[#8B6FC9] dark:text-slate-300">
                    🌐
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#292633] dark:text-white flex items-center gap-2">
                      Global Workspace
                      {activeProjectId === null && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#8B6FC9] text-white dark:bg-purple-500/20 dark:text-purple-300 font-semibold">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#686477] dark:text-slate-400 mt-0.5">
                      Standard workspace without specific project boundaries or pre-loaded documents.
                    </p>
                  </div>
                </div>
                {activeProjectId === null && <Check size={16} className="text-[#8B6FC9] dark:text-purple-400 shrink-0" />}
              </div>

              {/* User Workspaces List */}
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                const fileCount = project.files?.length || 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      onSelectProject(project.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between cursor-pointer group ${
                      isActive
                        ? 'border-[#8B6FC9]/60 bg-[#EEE8FA] dark:bg-purple-500/15 shadow-sm'
                        : 'border-[#E8E4EF] dark:border-white/[0.08] bg-[#F5F3F9] dark:bg-[#090614] hover:border-[#8B6FC9]/40 hover:bg-[#EEE8FA]/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FFFFFF] dark:bg-purple-500/15 border border-[#E8E4EF] dark:border-purple-400/25 flex items-center justify-center text-[#8B6FC9] dark:text-purple-400 shrink-0 mt-0.5">
                        📁
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#292633] dark:text-white truncate">{project.name}</h4>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#8B6FC9] text-white dark:bg-purple-500/20 dark:text-purple-300 font-semibold shrink-0">
                              Active
                            </span>
                          )}
                          {fileCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#E8E4EF] dark:border-white/10 text-[#686477] dark:text-slate-300 flex items-center gap-1 shrink-0">
                              <Paperclip size={10} className="text-[#8B6FC9] dark:text-purple-300" />
                              <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
                            </span>
                          )}
                        </div>

                        {project.description && (
                          <p className="text-[11px] text-[#686477] dark:text-slate-300 mt-1 line-clamp-1">{project.description}</p>
                        )}

                        {project.instructions && (
                          <p className="text-[10.5px] text-[#8B6FC9] dark:text-purple-300/80 mt-1 line-clamp-1 font-mono">
                            Instruction: {project.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStartEdit(project)}
                        className="p-1.5 rounded-lg text-[#686477] hover:text-[#292633] dark:hover:text-white hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] transition cursor-pointer"
                        title="Edit Workspace"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="p-1.5 rounded-lg text-[#686477] hover:text-[#C77B7B] hover:bg-[#F9ECEC] dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition cursor-pointer"
                        title="Delete Workspace"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  Mic,
  PanelLeft,
  Plus,
  Square,
  Sparkles,
  ArrowDown,
  X,
  Search,
  BookOpen,
  Settings,
  Download,
  UploadCloud,
  Copy,
  Share2,
  GitBranch,
  Star,
  Bookmark,
  Compass,
  Sliders,
  Wand2,
  Code2,
  FileText,
  Lightbulb,
  Layers,
  SquarePen,
  MoreHorizontal,
  Sun,
  Moon,
} from 'lucide-react';

import { applyTheme, initTheme, ThemeMode } from '@/lib/theme';
import Sidebar from '@/components/layout/Sidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import ImagePreview from '@/components/chat/ImagePreview';
import ModelSelector, { AI_MODELS, DEFAULT_MODEL_ID } from '@/components/chat/ModelSelector';
import { DEFAULT_VISION_MODEL_ID, getModelConfig, validateModelCapabilities } from '@/lib/models';
import InChatSearch from '@/components/chat/InChatSearch';
import SettingsModal from '@/components/modals/SettingsModal';
import RightPanel from '@/components/layout/RightPanel';
import PromptsPanel from '@/components/chat/PromptsPanel';
import ExportModal from '@/components/modals/ExportModal';
import VoiceModeModal from '@/components/modals/VoiceModeModal';
import FavoritesModal from '@/components/modals/FavoritesModal';
import ProjectModal from '@/components/modals/ProjectModal';
import { extractPdfText } from '@/lib/extractPdfText';
import { getDynamicGreeting, GreetingData } from '@/lib/greetings';
import { useToast } from '@/components/ui/Toast';
import { Msg, Chat, WebSource, FileAttachment, WorkspaceProject } from '@/lib/types';
import {
  saveProjects,
  loadProjects,
  getActiveProjectId,
  setActiveProjectId as storeActiveProjectId,
} from '@/lib/storage';
import FilePreview from '@/components/chat/FilePreview';
import { analyzeIntentForToolCalls } from '@/lib/services/toolService';
import { formatMemoriesForPrompt, syncMemoriesWithCloud, setMemoryActiveUser } from '@/lib/services/memoryService';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  validatePdfFile,
  validateImageFile,
  sanitizeAttachmentForStorage,
  MAX_PDFS,
  MAX_IMAGES,
} from '@/lib/fileHandling';
import { compressImageFile } from '@/lib/imageUtils';
import {
  fetchCloudConversations,
  saveCloudConversation,
  saveCloudMessage,
  updateCloudConversationTitle,
  deleteCloudConversation,
  togglePinCloudConversation,
  toggleArchiveCloudConversation,
  clearAllUserConversations,
  migrateLocalChatsToCloud,
} from '@/lib/supabase/chatService';

export default function ChatPage() {
  const { user, profile, preferences, updatePreferences } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [attachedPdfs, setAttachedPdfs] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [appLoading, setAppLoading] = useState(true);

  // Settings & Customization state
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [accentColor, setAccentColor] = useState('purple');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [greetingData, setGreetingData] = useState<GreetingData>(() => getDynamicGreeting());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [promptToSave, setPromptToSave] = useState<string | undefined>(undefined);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // In-Chat Search state
  const [isInChatSearchOpen, setIsInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Attachment & Web Search state
  const [pdfText, setPdfText] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfPages, setPdfPages] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [isNavMoreOpen, setIsNavMoreOpen] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const navMoreRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { addToast } = useToast();

  // Speech Recognition & Speech Synthesis hooks
  const {
    isListening,
    startListening,
    stopListening,
    error: speechError,
    isSupported: speechRecSupported,
  } = useSpeechRecognition({
    onTranscript: (liveTranscript) => {
      setInput(liveTranscript);
    },
  });

  const {
    speak: speakResponse,
    stop: stopSpeaking,
    isSpeaking,
    speakingMessageId,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (speechError) {
      addToast({ type: 'error', title: speechError });
    }
  }, [speechError, addToast]);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserScrolledUpRef = useRef<boolean>(false);
  const rafScrollIdRef = useRef<number | null>(null);
  const messages = currentChat?.messages ?? [];

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  }, []);

  const handleChatScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const isUp = distanceToBottom > 80;
    isUserScrolledUpRef.current = isUp;
    setShowScrollButton(isUp && messages.length > 0);
  }, [messages.length]);

  // Buttery-smooth, hardware-accelerated RAF glider during streaming
  const smoothGliderScroll = useCallback(() => {
    if (!scrollRef.current || isUserScrolledUpRef.current) return;
    if (rafScrollIdRef.current) return;

    rafScrollIdRef.current = requestAnimationFrame(() => {
      rafScrollIdRef.current = null;
      if (!scrollRef.current || isUserScrolledUpRef.current) return;
      const el = scrollRef.current;
      const target = el.scrollHeight;
      const current = el.scrollTop + el.clientHeight;
      const diff = target - current;

      if (diff > 0 && diff < 900) {
        el.scrollTop = target - el.clientHeight;
      } else if (diff >= 900) {
        el.scrollTo({ top: target, behavior: 'smooth' });
      }
    });
  }, []);

  // Auto smooth-scroll to bottom during response generation / streaming if user hasn't scrolled up
  useEffect(() => {
    if (!isUserScrolledUpRef.current && messages.length > 0) {
      smoothGliderScroll();
    }
    return () => {
      if (rafScrollIdRef.current) {
        cancelAnimationFrame(rafScrollIdRef.current);
        rafScrollIdRef.current = null;
      }
    };
  }, [messages, isLoading, thinking, smoothGliderScroll]);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 200);

    const savedModel = localStorage.getItem('nyra_selected_model');
    if (savedModel) setSelectedModelId(savedModel);

    // Verify configured providers and migrate unconfigured models automatically
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data?.configuredProviders) {
          const currentModel = savedModel || DEFAULT_MODEL_ID;
          const currentConfig = getModelConfig(currentModel);
          const isConfigured = data.configuredProviders[currentConfig.provider] ?? false;

          if (!isConfigured) {
            const fallbackId = data.defaultModelId || DEFAULT_MODEL_ID;
            setSelectedModelId(fallbackId);
            localStorage.setItem('nyra_selected_model', fallbackId);
          }
        }
      })
      .catch((e) => console.warn('Provider check error:', e));

    initTheme();
    const savedTheme = (localStorage.getItem('theme') as ThemeMode) || 'dark';
    setThemeMode(savedTheme);

    const savedAccent = localStorage.getItem('nyra_accent') || 'purple';
    setAccentColor(savedAccent);
    document.documentElement.setAttribute('data-accent', savedAccent);

    const savedFontSize = (localStorage.getItem('nyra_font_size') as any) || 'normal';
    setFontSize(savedFontSize);
    document.documentElement.setAttribute('data-font-size', savedFontSize);

    const savedBookmarks = localStorage.getItem('nyra_bookmarked_ids');
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      } catch (e) { }
    }

    const savedProjects = loadProjects();
    setProjects(savedProjects);
    const savedActiveProj = getActiveProjectId();
    if (savedActiveProj && savedProjects.some((p) => p.id === savedActiveProj)) {
      setActiveProjectId(savedActiveProj);
    } else {
      setActiveProjectId(null);
    }

    // Check for initial prompt passed from Tasks roadmap or quick links
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryPrompt = urlParams.get('q');
      const sessionPrompt = sessionStorage.getItem('nyra_initial_prompt');
      const targetPrompt = queryPrompt || sessionPrompt;

      if (targetPrompt) {
        setInput(targetPrompt);
        sessionStorage.removeItem('nyra_initial_prompt');
        window.history.replaceState({}, '', '/chat-ui');
        setTimeout(() => {
          composerTextareaRef.current?.focus();
        }, 150);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsSettingsOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setDesktopSidebarOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsInChatSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPromptLibraryOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isPromptLibraryOpen) setIsPromptLibraryOpen(false);
        if (isExportOpen) setIsExportOpen(false);
        if (isInChatSearchOpen) setIsInChatSearchOpen(false);
        if (isLoading && abortControllerRef.current) handleStopGeneration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isPromptLibraryOpen, isExportOpen, isInChatSearchOpen, isLoading]);

  // Network Status Listeners
  useEffect(() => {
    const handleOffline = () => {
      addToast({
        type: 'error',
        title: 'You are currently offline',
        description: 'Network disconnected. Local chats remain accessible.',
      });
    };
    const handleOnline = () => {
      addToast({
        type: 'success',
        title: 'Back online',
        description: 'Connected to Nyra AI services.',
      });
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [addToast]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navMoreRef.current && !navMoreRef.current.contains(e.target as Node)) {
        setIsNavMoreOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save model selection
  const handleSelectModel = (modelId: string) => {
    const model = AI_MODELS.find((m) => m.id === modelId);
    if (selectedImages.length > 0 && model && !model.supportsVision) {
      addToast({
        type: 'error',
        title: `This model does not support image understanding. Please select a vision-capable model.`,
      });
      return;
    }
    setSelectedModelId(modelId);
    localStorage.setItem('nyra_selected_model', modelId);
    updatePreferences({ defaultModel: modelId });
    addToast({ type: 'info', title: `Model: ${model?.name || modelId}` });
  };

  // Save bookmarks
  const handleToggleBookmark = (msgId: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(msgId)) {
      updated = bookmarkedIds.filter((id) => id !== msgId);
      addToast({ type: 'info', title: 'Bookmark Removed' });
    } else {
      updated = [...bookmarkedIds, msgId];
      addToast({ type: 'success', title: 'Message Bookmarked' });
    }
    setBookmarkedIds(updated);
    localStorage.setItem('nyra_bookmarked_ids', JSON.stringify(updated));
  };

  // Process image file with validation
  const processImageFile = async (file: File) => {
    const val = validateImageFile(file, selectedImages.length);
    if (!val.valid) {
      setUploadError(val.error || 'Invalid image file');
      addToast({ type: 'error', title: val.error || 'Invalid image file' });
      return;
    }

    // Check if active model supports vision
    const activeModel = AI_MODELS.find((m) => m.id === selectedModelId);
    if (activeModel && !activeModel.supportsVision) {
      setSelectedModelId(DEFAULT_VISION_MODEL_ID);
      addToast({
        type: 'info',
        title: 'Switched to Nyra Vision 4.0 for image understanding',
      });
    }

    try {
      const dataUrl = await compressImageFile(file);
      if (!dataUrl) {
        addToast({ type: 'error', title: 'Failed to process image' });
        return;
      }
      setSelectedImages((prev) => {
        if (prev.length >= MAX_IMAGES) return prev;
        if (prev.includes(dataUrl)) {
          addToast({ type: 'info', title: `"${file.name}" is already attached.` });
          return prev;
        }
        return [...prev, dataUrl];
      });
      setUploadError(null);
      addToast({ type: 'success', title: 'Image attached (Vision Ready)' });
    } catch (err) {
      console.error('Image compression error:', err);
      addToast({ type: 'error', title: 'Failed to process image' });
    }
  };

  // Process PDF file with validation and extraction
  const processPdfFile = async (file: File) => {
    const isDuplicate = attachedPdfs.some(
      (p) => p.name === file.name && p.size === file.size
    );
    if (isDuplicate) {
      addToast({ type: 'info', title: `"${file.name}" is already attached.` });
      return;
    }

    const val = validatePdfFile(file, attachedPdfs.length);
    if (!val.valid) {
      setUploadError(val.error || 'Invalid PDF document');
      addToast({ type: 'error', title: val.error || 'Invalid PDF document' });
      return;
    }

    const tempId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const initialAttachment: FileAttachment = {
      id: tempId,
      name: file.name,
      type: 'pdf',
      size: file.size,
      pages: 0,
      status: 'processing',
      fileRef: file,
    };

    setAttachedPdfs((prev) => {
      if (prev.length >= MAX_PDFS) return prev;
      return [...prev, initialAttachment];
    });
    setUploadError(null);

    try {
      const data = await extractPdfText(file);
      setAttachedPdfs((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
              ...p,
              pages: data.pages,
              extractedText: data.text,
              status: 'ready',
            }
            : p
        )
      );
      setPdfText((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
      setPdfName(file.name);
      setPdfPages(data.pages);
      addToast({ type: 'success', title: `Attached PDF: ${file.name} (${data.pages} pgs)` });
    } catch {
      setAttachedPdfs((prev) =>
        prev.map((p) => (p.id === tempId ? { ...p, status: 'failed', errorMessage: 'Failed to parse PDF' } : p))
      );
      setUploadError(`Failed to parse ${file.name}. Ensure it is not corrupted.`);
      addToast({ type: 'error', title: `Failed to parse ${file.name}` });
    }
  };

  const handleRetryPdf = async (id: string) => {
    const target = attachedPdfs.find((p) => p.id === id);
    if (!target || !target.fileRef) return;

    setAttachedPdfs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'processing', errorMessage: undefined } : p))
    );

    try {
      const data = await extractPdfText(target.fileRef);
      setAttachedPdfs((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
              ...p,
              pages: data.pages,
              extractedText: data.text,
              status: 'ready',
            }
            : p
        )
      );
      setPdfText(data.text);
      setPdfName(target.name);
      setPdfPages(data.pages);
      addToast({ type: 'success', title: `Reparsed ${target.name} (${data.pages} pgs)` });
    } catch {
      setAttachedPdfs((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'failed', errorMessage: 'Parsing failed' } : p
        )
      );
      addToast({ type: 'error', title: `Retry failed for ${target.name}` });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => processImageFile(file));
    if (e.target) e.target.value = '';
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => processPdfFile(file));
    if (e.target) e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        processPdfFile(file);
      }
    });
  };

  const handleRemoveImage = (index?: number) => {
    if (index !== undefined) {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages([]);
    }
  };

  const handleRemovePdf = (id?: string) => {
    if (id) {
      setAttachedPdfs((prev) => prev.filter((p) => p.id !== id));
    } else {
      setAttachedPdfs([]);
    }
    setPdfText('');
    setPdfName('');
    setPdfPages(0);
  };

  // Load Chats (Cloud first if authenticated, localStorage fallback)
  useEffect(() => {
    let isMounted = true;

    async function initChats() {
      if (user?.id) {
        setMemoryActiveUser(user.id);
        syncMemoriesWithCloud(user.id).catch(() => {});
        try {
          const cloudChats = await fetchCloudConversations(user.id);
          if (!isMounted) return;
          if (cloudChats && cloudChats.length > 0) {
            setChats(cloudChats);
            setCurrentChatId(cloudChats[0].id);

            // Check if local chats exist to offer or trigger migration
            const localSaved = localStorage.getItem('nyra_chats');
            if (localSaved) {
              try {
                const localParsed: Chat[] = JSON.parse(localSaved);
                const unSynced = localParsed.filter((lc) => !cloudChats.some((cc) => cc.id === lc.id));
                if (unSynced.length > 0) {
                  migrateLocalChatsToCloud(user.id, unSynced).then((res) => {
                    if (res.migrated > 0) {
                      addToast({ type: 'success', title: `Synced ${res.migrated} offline chats to cloud` });
                    }
                  });
                }
              } catch { }
            }
            return;
          }
        } catch (e) {
          console.warn('Could not load cloud conversations:', e);
        }
      }

      const saved = localStorage.getItem('nyra_chats');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0 && isMounted) {
            setChats(
              parsed.map((chat: Chat) => ({
                ...chat,
                createdAt: chat.createdAt || Date.now(),
                updatedAt: chat.updatedAt || Date.now(),
              }))
            );
            setCurrentChatId(parsed[0].id);
            return;
          }
        } catch { }
      }

      if (isMounted) {
        const firstChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setChats([firstChat]);
        setCurrentChatId(firstChat.id);
      }
    }

    initChats();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save Chats (Sanitize attachments before persisting to localStorage)
  useEffect(() => {
    if (chats.length > 0) {
      const sanitized = chats.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({
          ...m,
          attachments: m.attachments ? m.attachments.map(sanitizeAttachmentForStorage) : undefined,
        })),
      }));
      localStorage.setItem('nyra_chats', JSON.stringify(sanitized));
    }
  }, [chats]);

  const handleToggleDesktopSidebar = () => {
    setDesktopSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('nyra_desktop_sidebar_open', String(next));
      return next;
    });
  };

  // Scroll handler with user manual scroll detection
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
          const userScrolledUp = distanceFromBottom > 100;

          isUserScrolledUpRef.current = userScrolledUp;
          setShowScrollButton(userScrolledUp && scrollHeight > clientHeight + 120);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Frame-by-frame seamless streaming follow
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isUserScrolledUpRef.current) return;

    window.requestAnimationFrame(() => {
      if (!isUserScrolledUpRef.current && container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [messages, isLoading]);

  // Reset scroll state on switching chat
  useEffect(() => {
    isUserScrolledUpRef.current = false;
    setShowScrollButton(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChatId]);

  // Close tools menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProject = (projectId: string | null) => {
    setActiveProjectId(projectId);
    storeActiveProjectId(projectId);
    const matchingChats = chats.filter((c) =>
      projectId ? c.projectId === projectId : !c.projectId
    );
    if (matchingChats.length > 0) {
      setCurrentChatId(matchingChats[0].id);
    } else {
      handleNewChat(projectId);
    }
  };

  const handleCreateProject = (projectData: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: WorkspaceProject = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setActiveProjectId(newProject.id);
    storeActiveProjectId(newProject.id);
    handleNewChat(newProject.id);
    addToast({ type: 'success', title: `Project "${newProject.name}" created` });
  };

  const handleUpdateProject = (id: string, updates: Partial<WorkspaceProject>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
    setProjects(updated);
    saveProjects(updated);
    addToast({ type: 'success', title: 'Project updated' });
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(null);
      storeActiveProjectId(null);
    }
    setChats((prev) =>
      prev.map((c) => (c.projectId === id ? { ...c, projectId: undefined } : c))
    );
    addToast({ type: 'info', title: 'Project deleted' });
  };

  const handleNewChat = (targetProjectId?: string | null) => {
    if (isLoading) return;
    const defaultModel =
      preferences?.defaultModel ||
      localStorage.getItem('nyra_selected_model') ||
      'qwen/qwen3.6-27b';
    setSelectedModelId(defaultModel);

    // Clean up empty chats from state to prevent duplicates in history
    setChats((prev) => prev.filter((c) => c.messages && c.messages.length > 0));

    // Fresh draft conversation state (not saved in history until first message is sent)
    const freshDraftId = Date.now().toString();
    setCurrentChatId(freshDraftId);
    setGreetingData(getDynamicGreeting());
    setInput('');
    setSelectedImages([]);
    setAttachedPdfs([]);
    setPdfText('');
    setPdfName('');
    setPdfPages(0);
    setWebSearch(false);
    setDeepResearch(false);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    const targetChat = chats.find((c) => c.id === id);
    if (!targetChat || !targetChat.messages || targetChat.messages.length === 0) {
      setGreetingData(getDynamicGreeting());
    }
  };

  const handleBranchFromMessage = (msgId: string) => {
    if (!currentChatId) return;
    const targetIndex = messages.findIndex((m) => m.id === msgId);
    if (targetIndex === -1) return;

    const branchMessages = messages.slice(0, targetIndex + 1);
    const branchChat: Chat = {
      id: Date.now().toString(),
      title: `${currentChat?.title || 'Chat'} (Branch)`,
      messages: branchMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      branchParentId: currentChatId,
      branchPointMsgId: msgId,
    };

    setChats((prev) => [branchChat, ...prev]);
    setCurrentChatId(branchChat.id);
    addToast({ type: 'success', title: 'Branched conversation from this message' });
  };

  const handleCopyConversation = () => {
    if (!messages || messages.length === 0) {
      addToast({ type: 'info', title: 'No messages to copy' });
      return;
    }
    const chatTitle = chats.find((c) => c.id === currentChatId)?.title || 'Nyra AI Conversation';
    let formattedText = `NYRA AI — ${chatTitle}\nDate: ${new Date().toLocaleString()}\n==================================================\n\n`;
    formattedText += messages
      .map((m) => {
        const timeStr = m.timestamp ? ` [${new Date(m.timestamp).toLocaleTimeString()}]` : '';
        const roleStr = m.role === 'user' ? 'USER' : 'NYRA AI' + (m.modelId ? ` (${m.modelId})` : '');
        return `${roleStr}${timeStr}:\n${m.content}`;
      })
      .join('\n\n--------------------------------------------------\n\n');

    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(formattedText);
      addToast({ type: 'success', title: 'Conversation copied.' });
    }
  };

  const handleShareConversation = () => {
    if (!messages || messages.length === 0) {
      addToast({ type: 'info', title: 'No messages to share' });
      return;
    }
    const activeChat = chats.find((c) => c.id === currentChatId);
    const shareId = currentChatId || Date.now().toString();
    if (activeChat) {
      localStorage.setItem(`nyra_share_${shareId}`, JSON.stringify(activeChat));
    }
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${shareId}` : '';
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      addToast({
        type: 'success',
        title: 'Share link copied to clipboard',
      });
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setThinking(false);
      addToast({ type: 'info', title: 'Generation stopped' });
    }
  };

  const streamAssistantResponse = useCallback(
    async ({
      nextMessages,
      assistantMessage,
      chatId,
      isContinuation = false,
      initialContent = '',
      activePdfDocuments,
      activePdfText,
    }: {
      nextMessages: Msg[];
      assistantMessage: Msg;
      chatId: string;
      isContinuation?: boolean;
      initialContent?: string;
      activePdfDocuments?: FileAttachment[];
      activePdfText?: string;
    }) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);
      setThinking(true);

      const targetPdfs =
        activePdfDocuments && activePdfDocuments.length > 0
          ? activePdfDocuments
          : attachedPdfs.filter((p) => p.status === 'ready');
      const targetPdfText =
        activePdfText ||
        targetPdfs.map((p) => p.extractedText).filter(Boolean).join('\n\n') ||
        pdfText;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
              image: m.image,
              images: m.images,
              pdfContext:
                m.pdfContext ||
                m.attachments?.map((a) => a.extractedText).filter(Boolean).join('\n\n') ||
                (m.pdfName ? targetPdfText : undefined),
            })),
            pdfText: targetPdfText || undefined,
            attachments: targetPdfs.map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              size: p.size,
              pages: p.pages,
              status: p.status,
              extractedText: p.extractedText,
            })),
            pdfDocuments: targetPdfs.map((p) => ({
              name: p.name,
              pages: p.pages,
              text: p.extractedText,
            })),
            model: selectedModelId,
            webSearch: webSearch || deepResearch,
            deepResearch,
            mode: deepResearch ? 'research' : undefined,
            isContinuation,
            partialResponse: isContinuation ? initialContent : undefined,
            projectInstructions: (() => {
              const chatObj = chats.find((c) => c.id === chatId);
              const effProjId = chatObj?.projectId || activeProjectId;
              const curProj = projects.find((p) => p.id === effProjId);
              return curProj?.instructions || undefined;
            })(),
            workspaceFiles: (() => {
              const chatObj = chats.find((c) => c.id === chatId);
              const effProjId = chatObj?.projectId || activeProjectId;
              const curProj = projects.find((p) => p.id === effProjId);
              return curProj?.files?.map((f) => ({
                name: f.name,
                pages: f.pages,
                text: f.extractedText,
              })) || undefined;
            })(),
            workspaceNotes: (() => {
              const chatObj = chats.find((c) => c.id === chatId);
              const effProjId = chatObj?.projectId || activeProjectId;
              const curProj = projects.find((p) => p.id === effProjId);
              return curProj?.notes || undefined;
            })(),
            userMemories: formatMemoriesForPrompt() || undefined,
          }),
          signal: controller.signal,
        });

        if (response.status === 429) {
          const errText = await response.text();
          addToast({ type: 'error', title: errText || 'Daily usage limit reached' });
          throw new Error(errText || 'Daily usage limit reached');
        }

        if (!response.ok) {
          const errorMsg = await response.text().catch(() => 'API request failed');
          throw new Error(errorMsg || 'API request failed');
        }
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamAccumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) {
              streamAccumulated += chunk;
              setThinking(false);

              const separator = initialContent && (initialContent.endsWith(' ') || initialContent.endsWith('\n') || streamAccumulated.startsWith(' ') || streamAccumulated.startsWith('\n')) ? '' : ' ';
              const currentFullContent = initialContent ? initialContent + separator + streamAccumulated : streamAccumulated;

              setChats((prev) =>
                prev.map((chat) => {
                  if (chat.id !== chatId) return chat;
                  const updated = chat.messages.map((m) =>
                    m.id === assistantMessage.id ? { ...m, content: currentFullContent } : m
                  );
                  return { ...chat, messages: updated, updatedAt: Date.now() };
                })
              );

              // Follow streaming response with buttery-smooth RAF glider
              smoothGliderScroll();
            }
          }
        }

        // Drain any remaining decoded bytes
        const remainingChunk = decoder.decode();
        if (remainingChunk) {
          streamAccumulated += remainingChunk;
        }

        const finalSeparator = initialContent && (initialContent.endsWith(' ') || initialContent.endsWith('\n') || streamAccumulated.startsWith(' ') || streamAccumulated.startsWith('\n')) ? '' : ' ';
        const finalFullContent = initialContent ? initialContent + finalSeparator + streamAccumulated : streamAccumulated;

        // Fetch dynamic follow-up suggestions non-blockingly
        const lastUserMsg = [...nextMessages].reverse().find((m) => m.role === 'user');
        const previousSuggestions = nextMessages
          .flatMap((m) => m.suggestedFollowUps || [])
          .filter(Boolean);
        const docName = targetPdfs?.[0]?.name || lastUserMsg?.attachments?.[0]?.name || undefined;
        let suggestions: string[] = [];

        try {
          const suggRes = await fetch('/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: lastUserMsg?.content || '',
              response: finalFullContent,
              recentMessages: nextMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
              previousSuggestions,
              documentName: docName,
            }),
          });
          if (suggRes.ok) {
            const suggData = await suggRes.json();
            if (Array.isArray(suggData?.suggestions) && suggData.suggestions.length > 0) {
              suggestions = suggData.suggestions;
            }
          }
        } catch (suggErr) {
          console.error('Failed to load suggestions:', suggErr);
        }

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== chatId) return chat;
            const updated = chat.messages.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: finalFullContent, suggestedFollowUps: suggestions }
                : m
            );
            return { ...chat, messages: updated, updatedAt: Date.now() };
          })
        );

        // Save completed assistant message to cloud
        if (user?.id) {
          saveCloudMessage(user.id, chatId, {
            ...assistantMessage,
            content: finalFullContent,
            suggestedFollowUps: suggestions,
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          const isLimitErr = err.message?.includes('limit reached');
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id !== chatId) return chat;
              const updated = chat.messages.map((m) =>
                m.id === assistantMessage.id
                  ? {
                    ...m,
                    content:
                      m.content.trim().length > 0
                        ? m.content
                        : `✦ Error: ${err.message || 'Unable to generate response. Please check your connection and try again.'}`,
                  }
                  : m
              );
              return { ...chat, messages: updated };
            })
          );
        }
      } finally {
        setIsLoading(false);
        setThinking(false);
        abortControllerRef.current = null;
      }
    },
    [pdfText, attachedPdfs, selectedModelId, webSearch, deepResearch, user, addToast]
  );

  const handleContinueResponse = async (msgId?: string) => {
    if (isLoading || !currentChatId) return;
    const targetId = msgId || messages.filter((m) => m.role === 'assistant').pop()?.id;
    if (!targetId) return;

    const assistantIndex = messages.findIndex((m) => m.id === targetId);
    if (assistantIndex === -1) return;

    const existingMsg = messages[assistantIndex];
    const initialContent = existingMsg.content;
    if (!initialContent) return;

    const conversation = messages.slice(0, assistantIndex);

    await streamAssistantResponse({
      nextMessages: conversation,
      assistantMessage: existingMsg,
      chatId: currentChatId,
      isContinuation: true,
      initialContent,
    });
  };

  const handleRegenerateResponse = async (msgId: string) => {
    if (isLoading || !currentChatId) return;
    const assistantIndex = messages.findIndex((m) => m.id === msgId);
    if (assistantIndex <= 0) return;

    const conversation = messages.slice(0, assistantIndex);
    const assistantMessage: Msg = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      modelId: selectedModelId,
      timestamp: Date.now(),
    };

    const nextMessages = [...conversation, assistantMessage];
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: nextMessages, updatedAt: Date.now() }
          : chat
      )
    );

    await streamAssistantResponse({
      nextMessages: conversation,
      assistantMessage,
      chatId: currentChatId,
    });
  };

  const handleSubmit = async (overridePrompt?: string) => {
    if (isLoading) {
      addToast({ type: 'info', title: 'Generation in progress. Please stop or wait before sending.' });
      return;
    }
    const textToSend = overridePrompt || input;
    const readyPdfs = attachedPdfs.filter((p) => p.status === 'ready');
    const isProcessingPdfs = attachedPdfs.some((p) => p.status === 'processing');

    if (isProcessingPdfs) {
      addToast({ type: 'info', title: 'Please wait for attached PDFs to finish processing' });
      return;
    }

    if ((!textToSend.trim() && selectedImages.length === 0 && readyPdfs.length === 0 && !pdfText) || isLoading) return;

    // Pre-flight capability validation for attachments
    const hasImagesToSend = selectedImages.length > 0;
    const modelCap = validateModelCapabilities(selectedModelId, { hasImages: hasImagesToSend });
    if (!modelCap.valid) {
      addToast({
        type: 'error',
        title: modelCap.error || 'This model does not support image analysis. Please select a vision model.',
      });
      return;
    }

    let targetChatId = currentChatId;
    let baseMessages = messages;

    const chatTitle =
      textToSend.trim().slice(0, 32) ||
      (readyPdfs.length > 0 ? readyPdfs[0].name : selectedImages.length > 0 ? 'Image Analysis' : 'New Chat');

    const existingChat = chats.find((c) => c.id === targetChatId);
    if (!targetChatId || !existingChat) {
      const newChatId = targetChatId || Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        projectId: activeProjectId || undefined,
        title: chatTitle,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChats((prev) => [newChat, ...prev.filter((c) => c.id !== newChatId && c.messages && c.messages.length > 0)]);
      targetChatId = newChat.id;
      setCurrentChatId(newChat.id);
      baseMessages = [];

      if (user?.id) {
        saveCloudConversation(user.id, newChat);
      }
    }

    const defaultPrompt = readyPdfs.length > 0
      ? `Please analyze and summarize the attached document(s): ${readyPdfs.map((p) => p.name).join(', ')}`
      : selectedImages.length > 0
        ? 'Analyze this attached media.'
        : '';

    const readyPdfText =
      readyPdfs.map((p) => p.extractedText).filter(Boolean).join('\n\n') || pdfText;

    const detectedTool = analyzeIntentForToolCalls(textToSend.trim());
    if (detectedTool) {
      addToast({
        type: 'success',
        title: detectedTool.message || 'AI Tool Executed',
      });
    }

    const userMessage: Msg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim() || defaultPrompt,
      mode: deepResearch ? 'research' : undefined,
      image: selectedImages[0] || undefined,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      attachments: readyPdfs.length > 0 ? readyPdfs : undefined,
      pdfName: readyPdfs.length > 0 ? readyPdfs[0].name : pdfName || undefined,
      pdfPages: readyPdfs.length > 0 ? readyPdfs[0].pages : pdfPages || undefined,
      pdfContext: readyPdfText || undefined,
      timestamp: Date.now(),
    };

    const assistantMessage: Msg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      modelId: selectedModelId,
      toolCalls: detectedTool ? [detectedTool] : undefined,
      timestamp: Date.now(),
    };

    const nextMessages = [...baseMessages, userMessage, assistantMessage];

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== targetChatId) return chat;
        const newTitle =
          chat.messages.length === 0
            ? chatTitle
            : chat.title;
        return {
          ...chat,
          title: newTitle,
          messages: nextMessages,
          updatedAt: Date.now(),
        };
      })
    );

    if (user?.id && targetChatId) {
      saveCloudConversation(user.id, {
        id: targetChatId,
        title: chatTitle,
        messages: nextMessages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      saveCloudMessage(user.id, targetChatId, userMessage);
    }

    const currentPdfText = readyPdfText;
    const currentReadyPdfs = [...readyPdfs];

    setInput('');
    setSelectedImages([]);
    setAttachedPdfs([]);
    setPdfText('');
    setPdfName('');
    setPdfPages(0);

    await streamAssistantResponse({
      nextMessages: [...baseMessages, userMessage],
      assistantMessage,
      chatId: targetChatId,
      activePdfDocuments: currentReadyPdfs,
      activePdfText: currentPdfText,
    });
  };

  const handleEditMessage = async (msgId: string, newContent: string) => {
    if (!currentChatId) return;
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    const updatedUserMsg = { ...messages[msgIndex], content: newContent };
    const conversation = [...messages.slice(0, msgIndex), updatedUserMsg];

    const assistantMessage: Msg = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      modelId: selectedModelId,
      timestamp: Date.now(),
    };

    const nextMessages = [...conversation, assistantMessage];

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: nextMessages, updatedAt: Date.now() }
          : chat
      )
    );

    await streamAssistantResponse({
      nextMessages: conversation,
      assistantMessage,
      chatId: currentChatId,
    });
  };

  const handleNavigateToFavoriteMessage = (chatId: string, messageId: string) => {
    setCurrentChatId(chatId);
    setIsFavoritesOpen(false);
    setSidebarOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`msg-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-cyan-400', 'bg-cyan-500/10');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-cyan-400', 'bg-cyan-500/10');
        }, 2500);
      }
    }, 200);
  };

  if (appLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#040a17]">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 animate-pulse flex items-center justify-center text-white shadow-2xl">
          <span className="text-lg font-bold">✦</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex h-[100dvh] w-full max-w-full overflow-hidden bg-[#07050d] text-[#ede7f3]"
    >
      {/* DRAG AND DROP OVERLAY */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md border-2 border-dashed border-purple-400/50">
          <div className="text-center p-6 sm:p-8 rounded-2xl bg-[#130f24] border border-purple-400/25 max-w-[90vw]">
            <UploadCloud size={40} className="mx-auto text-purple-400 mb-3 animate-bounce" />
            <h3 className="text-base font-bold text-white">Drop File to Attach</h3>
            <p className="text-xs text-slate-400 mt-1">Images & PDFs supported</p>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY (Below md) */}
      <div
        className={`fixed inset-0 z-50 flex md:hidden pointer-events-none transition-all duration-300 ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        />

        {/* Mobile Slide-in Drawer */}
        <div
          className={`relative z-10 flex h-full w-[285px] sm:w-[300px] max-w-[85vw] flex-col bg-[#f8f6fc] dark:bg-[#07050d] border-r border-purple-200 dark:border-purple-400/20 shadow-2xl transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onOpenProjectsModal={() => setIsProjectModalOpen(true)}
            onSelect={(id) => {
              handleSelectChat(id);
              setSidebarOpen(false);
            }}
            onNewChat={() => {
              handleNewChat();
              setSidebarOpen(false);
            }}
            onRename={(id, title) => {
              setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)));
              if (user?.id) {
                updateCloudConversationTitle(user.id, id, title);
              }
            }}
            onDelete={(id) => {
              const updated = chats.filter((c) => c.id !== id);
              setChats(updated);
              if (currentChatId === id) {
                if (updated.length) setCurrentChatId(updated[0].id);
                else handleNewChat();
              }
              if (user?.id) {
                deleteCloudConversation(user.id, id);
              }
            }}
            onPin={(id) => {
              setChats((prev) =>
                prev.map((c) => {
                  if (c.id === id) {
                    const nextPinned = !c.pinned;
                    if (user?.id) togglePinCloudConversation(user.id, id, nextPinned);
                    return { ...c, pinned: nextPinned };
                  }
                  return c;
                })
              );
            }}
            onArchive={(id) => {
              setChats((prev) =>
                prev.map((c) => {
                  if (c.id === id) {
                    if (user?.id) toggleArchiveCloudConversation(user.id, id, true);
                    return { ...c, archived: true };
                  }
                  return c;
                })
              );
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
            onOpenFavorites={() => setIsFavoritesOpen(true)}
            onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onCloseMobile={() => setSidebarOpen(false)}
            onToggleCollapse={() => setSidebarOpen(false)}
            favoritesCount={bookmarkedIds.length}
          />
        </div>
      </div>

      {/* DESKTOP SIDEBAR - TRANSPARENT (NO BACKGROUND) */}
      <aside
        style={{
          width: desktopSidebarOpen ? 290 : 0,
          minWidth: 0,
          transition: 'width 260ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="hidden md:flex h-full shrink-0 flex-col overflow-hidden relative z-20 bg-transparent"
      >
        <div className="w-[290px] h-full flex flex-col shrink-0 bg-transparent">
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onOpenProjectsModal={() => setIsProjectModalOpen(true)}
            onSelect={handleSelectChat}
            onNewChat={handleNewChat}
            onRename={(id, title) => {
              setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)));
              if (user?.id) {
                updateCloudConversationTitle(user.id, id, title);
              }
            }}
            onDelete={(id) => {
              const updated = chats.filter((c) => c.id !== id);
              setChats(updated);
              if (currentChatId === id) {
                if (updated.length) setCurrentChatId(updated[0].id);
                else handleNewChat();
              }
              if (user?.id) {
                deleteCloudConversation(user.id, id);
              }
            }}
            onPin={(id) => {
              setChats((prev) =>
                prev.map((c) => {
                  if (c.id === id) {
                    const nextPinned = !c.pinned;
                    if (user?.id) togglePinCloudConversation(user.id, id, nextPinned);
                    return { ...c, pinned: nextPinned };
                  }
                  return c;
                })
              );
            }}
            onArchive={(id) => {
              setChats((prev) =>
                prev.map((c) => {
                  if (c.id === id) {
                    if (user?.id) toggleArchiveCloudConversation(user.id, id, true);
                    return { ...c, archived: true };
                  }
                  return c;
                })
              );
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
            onOpenFavorites={() => setIsFavoritesOpen(true)}
            onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onCloseMobile={() => setDesktopSidebarOpen(false)}
            onToggleCollapse={() => setDesktopSidebarOpen(false)}
            favoritesCount={bookmarkedIds.length}
          />
        </div>
      </aside>

      {/* =========================================================
          CURVED CHAT SCREEN CONTAINER (Edge-to-edge on Mobile/Tablet, Floating rounded workspace on Desktop)
      ========================================================= */}
      <main className="flex-1 p-0 md:p-3 relative z-10 overflow-hidden flex flex-col min-w-0 h-full w-full bg-[#F8F7FB] dark:bg-[#07050d] transition-colors">
        {/* THE WORKSPACE CANVAS (Full viewport on Mobile, Curved on Desktop) */}
        <div className="relative flex-1 w-full h-full rounded-none md:rounded-[32px] overflow-hidden flex flex-col bg-[#FFFFFF] dark:bg-[linear-gradient(180deg,#1c1335_0%,#130c26_28%,#0a0715_60%,#000000_100%)] border-0 md:border md:border-[#E8E4EF] dark:md:border-purple-400/20 md:shadow-[0_12px_40px_rgba(41,38,51,0.04)] dark:md:shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(168,85,247,0.08)] transition-colors">


          {/* FLOATING TOP CONTROLS (Transparent, No Static Bar) */}
          <header className="relative z-30 flex items-center justify-between px-3 sm:px-4 md:px-5 h-13 sm:h-14 bg-transparent shrink-0 w-full">
            {/* TOP LEFT: Sidebar Collapse Trigger + New Chat + Model Selector Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {/* Mobile Sidebar Trigger */}
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/20 text-[#292633] dark:text-zinc-300 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
              >
                <PanelLeft size={15} />
              </button>

              {/* Mobile New Chat Quick Trigger */}
              <button
                onClick={() => handleNewChat()}
                aria-label="New chat"
                title="New chat"
                className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/20 text-[#292633] dark:text-zinc-300 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
              >
                <SquarePen size={14} />
              </button>

              {/* Desktop Re-Open Sidebar Trigger & New Chat */}
              {!desktopSidebarOpen && (
                <div className="hidden md:flex items-center gap-1">
                  <button
                    onClick={handleToggleDesktopSidebar}
                    aria-label="Open sidebar"
                    title="Open sidebar (Ctrl+B)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/25 text-[#292633] dark:text-zinc-300 hover:border-[#8B6FC9]/40 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer animate-[fadeIn_0.15s_ease-out]"
                  >
                    <PanelLeft size={15} />
                  </button>
                  <button
                    onClick={() => handleNewChat()}
                    aria-label="New chat"
                    title="New chat (Ctrl+N)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/25 text-[#292633] dark:text-zinc-300 hover:border-[#8B6FC9]/40 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer animate-[fadeIn_0.15s_ease-out]"
                  >
                    <SquarePen size={15} />
                  </button>
                </div>
              )}

              {/* Model Selector Dropdown (ChatGPT 4o Style) */}
              <ModelSelector
                selectedModelId={selectedModelId}
                onSelectModel={handleSelectModel}
                variant="navbar"
              />

              {/* Active Workspace Indicator Pill */}
              {(() => {
                const currentProj = projects.find((p) => p.id === activeProjectId);
                if (!currentProj) return null;
                return (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEE8FA] dark:bg-purple-500/15 hover:bg-[#E2D8F7] dark:hover:bg-purple-500/25 border border-[#E8E4EF] dark:border-purple-400/30 text-xs font-semibold text-[#6B52A3] dark:text-purple-200 hover:text-[#292633] dark:hover:text-white transition cursor-pointer shadow-xs backdrop-blur-sm"
                    title="Active Workspace: Click to switch or manage"
                  >
                    <Layers size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                    <span className="max-w-[120px] truncate">{currentProj.name}</span>
                  </button>
                );
              })()}
            </div>


            {/* TOP RIGHT: ChatGPT Signature Share Pill, Search, More Menu & Profile */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              {/* Right-Side Prompts Screen Button */}
              <button
                onClick={() => setIsPromptLibraryOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#E8E4EF] dark:border-purple-400/25 bg-[#F5F3F9] dark:bg-purple-500/10 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 text-xs font-semibold text-[#292633] dark:text-purple-200 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer shadow-xs"
                title="Open Prompts & Starters (Right Side)"
              >
                <BookOpen size={13} className="text-[#8B6FC9] dark:text-purple-300" />
                <span className="hidden sm:inline">Prompts</span>
              </button>

              {/* ChatGPT Signature Share Button Pill */}
              <button
                onClick={handleShareConversation}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E4EF] dark:border-purple-400/25 bg-[#F5F3F9] dark:bg-purple-500/10 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 text-xs font-semibold text-[#292633] dark:text-purple-100 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer shadow-xs"
                title="Share conversation"
              >
                <Share2 size={13} className="text-[#8B6FC9] dark:text-purple-300" />
                <span>Share</span>
              </button>

              {/* Search in Chat Trigger */}
              <button
                onClick={() => setIsInChatSearchOpen(!isInChatSearchOpen)}
                className="h-8 w-8 rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/20 text-[#292633] dark:text-zinc-300 hover:text-[#8B6FC9] dark:hover:text-white transition flex items-center justify-center cursor-pointer"
                title="Search conversation (Ctrl+F)"
              >
                <Search size={14} />
              </button>

              {/* Light / Dark Mode Quick Switcher */}
              <button
                onClick={() => {
                  const next: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
                  setThemeMode(next);
                  applyTheme(next);
                  addToast({
                    type: 'info',
                    title: next === 'light' ? 'Light mode enabled' : 'Dark mode enabled',
                  });
                }}
                className="h-8 w-8 rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/20 text-[#292633] dark:text-zinc-300 hover:text-[#8B6FC9] dark:hover:text-white transition flex items-center justify-center cursor-pointer"
                title={themeMode === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
                aria-label="Toggle light/dark theme"
              >
                {themeMode === 'light' ? (
                  <Moon size={14} className="text-[#6B52A3]" />
                ) : (
                  <Sun size={14} className="text-[#C49A5A]" />
                )}
              </button>

              {/* ChatGPT More Options Dropdown (...) */}
              <div className="relative" ref={navMoreRef}>
                <button
                  onClick={() => setIsNavMoreOpen(!isNavMoreOpen)}
                  className="h-8 w-8 rounded-lg bg-[#F5F3F9] dark:bg-purple-950/40 hover:bg-[#EEE8FA] dark:hover:bg-purple-900/60 border border-[#E8E4EF] dark:border-purple-400/20 text-[#292633] dark:text-zinc-300 hover:text-[#8B6FC9] dark:hover:text-white transition flex items-center justify-center cursor-pointer"
                  title="More conversation options"
                >
                  <MoreHorizontal size={15} />
                </button>

                {isNavMoreOpen && (
                  <div className="absolute right-0 top-10 w-52 sm:w-56 max-w-[calc(100vw-24px)] rounded-2xl border border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF] dark:bg-[#130f24]/98 shadow-2xl p-1.5 z-50 animate-[fadeIn_0.12s_ease-out] backdrop-blur-xl">
                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        const next: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
                        setThemeMode(next);
                        applyTheme(next);
                        addToast({
                          type: 'info',
                          title: next === 'light' ? 'Light mode enabled' : 'Dark mode enabled',
                        });
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      {themeMode === 'light' ? <Moon size={13} className="text-[#6B52A3]" /> : <Sun size={13} className="text-[#C49A5A]" />}
                      <span>{themeMode === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        handleShareConversation();
                      }}
                      className="sm:hidden w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      <Share2 size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                      <span>Share conversation</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        handleCopyConversation();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      <Copy size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                      <span>Copy conversation</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        setIsExportOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      <Download size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                      <span>Export conversation</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        setIsFavoritesOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      <Star size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                      <span>Bookmarks ({bookmarkedIds.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        setIsPromptLibraryOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      <BookOpen size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                      <span>Prompt Library</span>
                    </button>

                    <div className="h-[1px] bg-[#E8E4EF] dark:bg-white/[0.08] my-1" />

                    <button
                      onClick={() => {
                        setIsNavMoreOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-[#292633] dark:text-slate-200 hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 hover:text-[#8B6FC9] dark:hover:text-white transition cursor-pointer"
                    >
                      <Settings size={13} className="text-[#8B6FC9] dark:text-purple-400" />
                      <span>Configuration</span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile Avatar */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="h-8 w-8 rounded-full bg-[#8B6FC9] text-white font-bold text-xs flex items-center justify-center ring-1 ring-[#E8E4EF] dark:ring-purple-300/40 shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer ml-0.5"
                title={profile?.displayName || user?.email ? `${profile?.displayName || user?.email} (Settings)` : 'Account Settings'}
              >
                {profile?.displayName
                  ? profile.displayName.slice(0, 1).toUpperCase()
                  : user?.email
                    ? user.email.slice(0, 1).toUpperCase()
                    : 'N'}
              </button>
            </div>

            {/* In-Chat Search Bar Overlay */}
            {isInChatSearchOpen && (() => {
              const matchingIds = inChatSearchQuery.trim()
                ? messages
                  .filter((m) => m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase()))
                  .map((m) => m.id)
                : [];

              const handleNext = () => {
                if (matchingIds.length === 0) return;
                const nextIdx = (currentMatchIndex + 1) % matchingIds.length;
                setCurrentMatchIndex(nextIdx);
                const targetEl = document.getElementById(`msg-${matchingIds[nextIdx]}`);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              };

              const handlePrev = () => {
                if (matchingIds.length === 0) return;
                const prevIdx = (currentMatchIndex - 1 + matchingIds.length) % matchingIds.length;
                setCurrentMatchIndex(prevIdx);
                const targetEl = document.getElementById(`msg-${matchingIds[prevIdx]}`);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              };

              return (
                <InChatSearch
                  searchQuery={inChatSearchQuery}
                  onSearchChange={(q: string) => {
                    setInChatSearchQuery(q);
                    setCurrentMatchIndex(0);
                  }}
                  onClose={() => setIsInChatSearchOpen(false)}
                  matchCount={matchingIds.length}
                  currentMatchIndex={currentMatchIndex}
                  onNextMatch={handleNext}
                  onPrevMatch={handlePrev}
                />
              );
            })()}
          </header>

          {/* =========================================================
              CLAUDE-STYLE SPLIT WORKSPACE: CHAT ON LEFT + IN-CHAT PANEL ON RIGHT
          ========================================================= */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* LEFT COLUMN: CHAT FEED + FLOATING COMPOSER */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
              {/* CHAT SCROLL AREA (ChatGPT Structured Feed Flow) */}
              <div
                ref={scrollRef}
                onScroll={handleChatScroll}
                className="flex-1 overflow-y-auto pb-36 sm:pb-40 md:pb-44 px-3 sm:px-6 md:px-8 custom-scrollbar"
              >
                <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-[1120px] mx-auto">
                  {messages.length === 0 ? (
                    /* EMPTY STATE HERO: MINIMAL CLAUDE/CHATGPT STYLE GREETING */
                    <div className="flex flex-col items-center justify-center text-center px-4 min-h-[calc(100vh-280px)] sm:min-h-[calc(100vh-320px)] select-none">
                      <motion.div
                        key={greetingData.greeting}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex flex-col items-center max-w-xl mx-auto space-y-2.5 -translate-y-4 sm:-translate-y-6"
                      >
                        {/* Dynamic Greeting */}
                        <h1 className="chat-greeting-title text-2xl sm:text-[28px] md:text-[34px] font-semibold tracking-tight leading-snug">
                          {greetingData.greeting}
                        </h1>

                        {/* Optional Natural Subtitle */}
                        {greetingData.subtitle && (
                          <p className="chat-greeting-subtitle text-sm sm:text-base font-normal max-w-md">
                            {greetingData.subtitle}
                          </p>
                        )}
                      </motion.div>
                    </div>
                  ) : (
                    /* MESSAGES FEED */
                    <div className="py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
                      {messages.map((msg, i) => {
                        const prev = messages[i - 1];
                        const isGrouped = prev?.role === msg.role;
                        const isBookmarked = bookmarkedIds.includes(msg.id);

                        return (
                          <div
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className="transition-all duration-300"
                          >
                            <MessageBubble
                              id={msg.id}
                              role={msg.role}
                              content={msg.content}
                              image={msg.image}
                              images={msg.images}
                              pdfName={msg.pdfName}
                              pdfPages={msg.pdfPages}
                              timestamp={msg.timestamp}
                              isLast={i === messages.length - 1}
                              loading={isLoading && i === messages.length - 1}
                              streaming={isLoading && i === messages.length - 1}
                              isGrouped={isGrouped}
                              thinking={thinking}
                              sources={msg.sources}
                              suggestedFollowUps={msg.suggestedFollowUps}
                              hideFollowUps={input.trim().length > 0 || attachedPdfs.length > 0 || selectedImages.length > 0}
                              isBookmarked={isBookmarked}
                              modelId={msg.modelId}
                              isSpeaking={speakingMessageId === msg.id}
                              searchQuery={inChatSearchQuery.trim() || undefined}
                              onSpeak={() => speakResponse(msg.id, msg.content)}
                              onStopSpeak={stopSpeaking}
                              onToggleBookmark={handleToggleBookmark}
                              onBranch={handleBranchFromMessage}
                              onSmartAction={(p) => handleSubmit(p)}
                              onSelectFollowUp={(p) => handleSubmit(p)}
                              onEdit={handleEditMessage}
                              onContinue={() => handleContinueResponse(msg.id)}
                              onRegenerate={() => handleRegenerateResponse(msg.id)}
                            />
                          </div>
                        );
                      })}
                      {/* Scroll Anchor */}
                      <div ref={messagesEndRef} className="h-4 w-full pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* =========================================================
                  CHATGPT FLOATING COMPOSER
              ========================================================= */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                }}
                onDrop={handleDrop}
                className="absolute bottom-0 left-0 right-0 z-20 px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-5 pointer-events-none bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/90 to-transparent dark:from-black dark:via-black/90 dark:to-transparent pt-6 sm:pt-8 chatscreen-bottom-bar"
              >
                <div className="relative mx-auto w-full max-w-3xl pointer-events-auto">
                  {/* ChatGPT Circular Scroll to Bottom Arrow (Directly Above Input Bar) */}
                  <AnimatePresence>
                    {showScrollButton && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            isUserScrolledUpRef.current = false;
                            setShowScrollButton(false);
                            scrollRef.current?.scrollTo({
                              top: scrollRef.current.scrollHeight,
                              behavior: 'smooth',
                            });
                          }}
                          className="group h-8 w-8 rounded-full border border-[#E8E4EF] dark:border-purple-400/35 bg-[#FFFFFF]/95 dark:bg-[#130f24]/95 hover:bg-[#F5F3F9] dark:hover:bg-[#1c1533] hover:border-[#8B6FC9]/40 text-[#6B52A3] dark:text-purple-200 hover:text-[#292633] dark:hover:text-white flex items-center justify-center shadow-[0_4px_16px_rgba(41,38,51,0.08)] dark:shadow-[0_8px_20px_rgba(10,5,20,0.85)] backdrop-blur-xl transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                          title="Scroll to recent messages"
                          aria-label="Scroll to recent messages"
                        >
                          <ArrowDown size={15} className="text-[#8B6FC9] dark:text-purple-300 group-hover:text-[#292633] dark:group-hover:text-white transition-colors" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {uploadError && (
                    <div className="mb-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-rose-300">{uploadError}</p>
                      <button
                        onClick={() => setUploadError(null)}
                        className="text-rose-300 hover:text-white shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Structured Chat Input Bar */}
                  <div
                    className={`chat-composer-box rounded-[22px] sm:rounded-[28px] border transition-all px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-2xl ${isDraggingOver
                      ? 'border-[#8B6FC9] bg-[#EEE8FA]/98 ring-2 ring-[#8B6FC9]/50 shadow-[0_0_40px_rgba(139,111,201,0.2)]'
                      : 'border-[#E8E4EF] hover:border-[#8B6FC9]/40 focus-within:border-[#8B6FC9]/60 focus-within:ring-2 focus-within:ring-[#8B6FC9]/20 bg-[#FFFFFF] dark:border-purple-400/30 dark:hover:border-purple-400/50 dark:focus-within:border-purple-400/60 dark:bg-gradient-to-b dark:from-[#1c1335]/95 dark:via-[#140d28]/95 dark:to-[#0e091d]/95 shadow-[0_8px_30px_rgba(41,38,51,0.04)] dark:shadow-[0_20px_50px_rgba(10,5,20,0.7)]'
                      }`}
                  >
                    {/* Drag-over indicator overlay text */}
                    {isDraggingOver && (
                      <div className="mb-2 text-center text-xs font-semibold text-[#8B6FC9] dark:text-purple-300 animate-pulse">
                        ✦ Drop images or PDF documents here to attach to Nyra
                      </div>
                    )}

                    {/* Attachments Preview */}
                    {(selectedImages.length > 0 || attachedPdfs.length > 0) && (
                      <div className="mb-2.5 flex flex-wrap gap-2">
                        {selectedImages.length > 0 && (
                          <ImagePreview images={selectedImages} onRemove={handleRemoveImage} />
                        )}
                        {attachedPdfs.length > 0 && (
                          <FilePreview
                            attachments={attachedPdfs}
                            onRemove={handleRemovePdf}
                            onRetry={handleRetryPdf}
                          />
                        )}
                      </div>
                    )}

                    {/* Top: Auto-expanding Textarea */}
                    <div className="flex items-start">
                      <textarea
                        ref={composerTextareaRef}
                        value={input}
                        onPaste={handlePaste}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim() || selectedImages.length > 0 || attachedPdfs.length > 0) {
                              handleSubmit();
                            }
                          }
                        }}
                        rows={1}
                        placeholder={
                          attachedPdfs.length > 0
                            ? 'Ask a question about the attached PDF(s)...'
                            : selectedImages.length > 0
                              ? 'Ask a question about the attached image(s)...'
                              : 'Message Nyra...'
                        }
                        className="chat-composer-textarea w-full bg-transparent outline-none resize-none min-h-[36px] sm:min-h-[40px] max-h-36 sm:max-h-48 pt-0.5 sm:pt-1 text-[14px] sm:text-[15.5px] placeholder:text-[#92909B] dark:placeholder:text-purple-200/50 text-[#292633] dark:text-white leading-relaxed custom-scrollbar"
                      />
                    </div>

                    {/* Bottom Tools Row */}
                    <div className="mt-2 pt-2 border-t border-[#E8E4EF] dark:border-purple-400/20 flex items-center justify-between gap-1.5 sm:gap-2">
                      {/* Left Action Toolbar */}
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-nowrap overflow-x-auto no-scrollbar sm:overflow-visible">
                        {/* ChatGPT '+' Attach Button with Popover */}
                        <div ref={toolsMenuRef} className="relative">
                          <button
                            type="button"
                            onClick={() => setShowToolsMenu((v) => !v)}
                            className="h-8 w-8 rounded-full border border-[#E8E4EF] dark:border-purple-400/30 bg-[#F5F3F9] dark:bg-purple-500/10 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/20 text-[#6B52A3] dark:text-purple-200 hover:text-[#292633] dark:hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Add attachments or prompts"
                            aria-label="Add attachments"
                          >
                            <Plus size={16} strokeWidth={2.2} className="text-[#8B6FC9] dark:text-purple-300" />
                          </button>

                          {showToolsMenu && (
                            <div className="absolute bottom-10 left-0 w-52 sm:w-56 max-w-[calc(100vw-32px)] rounded-2xl border border-[#E8E4EF] dark:border-purple-400/30 bg-[#FFFFFF] dark:bg-[#130f24]/98 shadow-2xl overflow-hidden z-[999] p-1.5 backdrop-blur-xl animate-[fadeIn_0.12s_ease-out]">
                              <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 transition text-[#292633] dark:text-purple-100 hover:text-[#8B6FC9] dark:hover:text-white">
                                <span className="text-base">🖼️</span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold">Upload Images</span>
                                  <span className="text-[10.5px] text-[#92909B] dark:text-purple-300/70">PNG, JPG, WEBP</span>
                                </div>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                  multiple
                                  hidden
                                  onChange={(e) => {
                                    handleImageUpload(e);
                                    setShowToolsMenu(false);
                                  }}
                                />
                              </label>

                              <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 transition text-[#292633] dark:text-purple-100 hover:text-[#8B6FC9] dark:hover:text-white">
                                <span className="text-base">📄</span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold">Upload PDF</span>
                                  <span className="text-[10.5px] text-[#92909B] dark:text-purple-300/70">Analyze document</span>
                                </div>
                                <input
                                  ref={pdfInputRef}
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  multiple
                                  hidden
                                  onChange={(e) => {
                                    handlePdfUpload(e);
                                    setShowToolsMenu(false);
                                  }}
                                />
                              </label>

                              <div className="h-[1px] bg-[#E8E4EF] dark:bg-purple-400/20 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setIsPromptLibraryOpen(true);
                                  setShowToolsMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 transition text-[#292633] dark:text-purple-100 hover:text-[#8B6FC9] dark:hover:text-white text-left"
                              >
                                <span className="text-base">📚</span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold">Prompt Library</span>
                                  <span className="text-[10.5px] text-[#92909B] dark:text-purple-300/70">Pre-built templates</span>
                                </div>
                              </button>

                              {input.trim() && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPromptToSave(input.trim());
                                    setIsPromptLibraryOpen(true);
                                    setShowToolsMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#F5F3F9] dark:hover:bg-purple-500/20 transition text-[#292633] dark:text-purple-100 hover:text-[#8B6FC9] dark:hover:text-white text-left"
                                >
                                  <span className="text-base">💾</span>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold">Save Prompt</span>
                                    <span className="text-[10.5px] text-[#92909B] dark:text-purple-300/70">Save current input</span>
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Active Model Selector Inside Composer */}
                        <ModelSelector
                          selectedModelId={selectedModelId}
                          onSelectModel={handleSelectModel}
                          dropUp={true}
                          compact={true}
                        />

                        {/* Deep Research Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const next = !deepResearch;
                            setDeepResearch(next);
                            addToast({
                              type: next ? 'success' : 'info',
                              title: next ? 'Deep Research Enabled' : 'Deep Research Turned Off',
                              description: next
                                ? 'NYRA will conduct a structured, in-depth investigation on your prompt.'
                                : 'Switched back to standard chat mode.',
                            });
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${deepResearch
                            ? 'bg-[#F9F4EB] dark:bg-gradient-to-r dark:from-amber-500/25 dark:via-orange-500/20 dark:to-amber-500/25 border border-[#C49A5A] dark:border-amber-400/60 text-[#9C773E] dark:text-amber-200 shadow-[0_0_15px_rgba(196,154,90,0.15)] ring-1 ring-[#C49A5A]/40'
                            : 'bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-[#E8E4EF] dark:border-purple-400/20 text-[#686477] dark:text-purple-200 hover:text-[#292633] dark:hover:text-white'
                            }`}
                          title={deepResearch ? 'Deep Research is active (click to turn off)' : 'Turn on Deep Research for this prompt'}
                          aria-pressed={deepResearch}
                        >
                          <Search size={13} className={deepResearch ? 'text-[#C49A5A] dark:text-amber-300 stroke-[2.5]' : 'text-[#8B6FC9] dark:text-purple-300'} />
                          <span>Deep Research</span>
                          {deepResearch && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C49A5A] dark:bg-amber-400 animate-pulse" />
                          )}
                        </button>

                        {/* Prompts Library Pill */}
                        <button
                          type="button"
                          onClick={() => {
                            setPromptToSave(undefined);
                            setIsPromptLibraryOpen(true);
                          }}
                          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#686477] hover:text-[#292633] dark:text-purple-200 dark:hover:text-white bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-[#E8E4EF] dark:border-purple-400/20 transition cursor-pointer"
                          title="Open Prompt Library"
                        >
                          <BookOpen size={13} className="text-[#8B6FC9] dark:text-purple-300" />
                          <span>Prompts</span>
                        </button>

                        {/* Save prompt from input if text is present */}
                        {input.trim().length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPromptToSave(input.trim());
                              setIsPromptLibraryOpen(true);
                            }}
                            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[#6B52A3] hover:text-[#292633] dark:text-purple-300 dark:hover:text-white bg-[#EEE8FA] hover:bg-[#E2D8F7] dark:bg-purple-500/15 dark:hover:bg-purple-500/25 border border-[#E8E4EF] dark:border-purple-400/30 transition cursor-pointer"
                            title="Save current prompt to Library"
                          >
                            <Bookmark size={12} className="text-[#8B6FC9] dark:text-purple-300" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>

                      {/* Right Action Tools: Voice Dictation & Send / Stop */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Voice Input Microphone Button */}
                        <button
                          type="button"
                          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                          onClick={() => {
                            if (isListening) {
                              stopListening();
                              addToast({ type: 'info', title: 'Voice recording ended' });
                            } else {
                              if (!speechRecSupported) {
                                addToast({
                                  type: 'error',
                                  title: "Voice input isn't supported in this browser.",
                                });
                                return;
                              }
                              startListening();
                              addToast({ type: 'info', title: 'Listening... Speak your prompt' });
                            }
                          }}
                          className={`h-8 w-8 rounded-full border flex items-center justify-center transition cursor-pointer shadow-xs ${isListening
                            ? 'bg-[#C77B7B] border-[#C77B7B] text-white shadow-rose-500/50 animate-pulse ring-2 ring-[#C77B7B]/60'
                            : 'bg-[#F5F3F9] dark:bg-purple-500/15 border-[#E8E4EF] dark:border-purple-400/30 hover:bg-[#EEE8FA] dark:hover:bg-purple-500/30 text-[#6B52A3] dark:text-purple-200 hover:text-[#292633] dark:hover:text-white'
                            }`}
                          title={isListening ? 'Stop voice input' : 'Voice Mode (Speech to Text)'}
                        >
                          {isListening ? <Square size={12} className="fill-white" /> : <Mic size={14} />}
                        </button>

                        {/* Circular Send / Stop Button with ChatGPT Style */}
                        <button
                          type="button"
                          onClick={isLoading ? handleStopGeneration : () => {
                            if (input.trim() || selectedImages.length > 0 || attachedPdfs.length > 0) {
                              handleSubmit();
                            }
                          }}
                          disabled={!isLoading && !input.trim() && selectedImages.length === 0 && attachedPdfs.length === 0}
                          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150 ${isLoading
                            ? 'chat-stop-button active:scale-95 cursor-pointer shadow-md'
                            : input.trim() || selectedImages.length > 0 || attachedPdfs.length > 0
                              ? 'chat-accent-button text-white font-bold active:scale-95 cursor-pointer hover:scale-105'
                              : 'bg-[#F5F3F9] dark:bg-purple-500/10 border border-[#E8E4EF] dark:border-purple-400/20 text-[#92909B] dark:text-purple-300/30 cursor-not-allowed'
                            }`}
                          title={
                            isLoading
                              ? 'Stop generating'
                              : input.trim() || selectedImages.length > 0 || attachedPdfs.length > 0
                                ? 'Send message (Enter)'
                                : 'Type a message'
                          }
                          aria-label={isLoading ? 'Stop generating' : 'Send message'}
                        >
                          {isLoading ? (
                            <Square size={10} className="fill-current stroke-none" />
                          ) : (
                            <ArrowUp size={15} strokeWidth={2.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ChatGPT Signature Footer Disclaimer */}
                  <p className="mt-1.5 sm:mt-2 text-center text-[10.5px] sm:text-[11.5px] text-[#92909B] dark:text-purple-300/60 select-none tracking-tight font-normal">
                    Nyra can make mistakes. Check important info.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CLAUDE-STYLE IN-CHAT RIGHT WORKSPACE PANEL */}
            <RightPanel
              isOpen={isPromptLibraryOpen}
              onClose={() => {
                setIsPromptLibraryOpen(false);
                setPromptToSave(undefined);
              }}
              title="Prompts"
              subtitle="Create, save and reuse your prompts."
            >
              <PromptsPanel
                initialPromptToSave={promptToSave}
                onClose={() => {
                  setIsPromptLibraryOpen(false);
                  setPromptToSave(undefined);
                }}
                onSelectPrompt={(p) => {
                  setInput(p);
                  setIsPromptLibraryOpen(false);
                  setPromptToSave(undefined);
                  setTimeout(() => {
                    if (composerTextareaRef.current) {
                      composerTextareaRef.current.focus();
                    }
                  }, 40);
                }}
              />
            </RightPanel>
          </div>
        </div>
      </main>

      {/* ALL MODALS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModelId}
        onSelectModel={handleSelectModel}
        accentColor={accentColor}
        onChangeAccent={(col) => {
          setAccentColor(col);
          localStorage.setItem('nyra_accent', col);
          document.documentElement.setAttribute('data-accent', col);
        }}
        fontSize={fontSize}
        onChangeFontSize={(size) => {
          setFontSize(size);
          localStorage.setItem('nyra_font_size', size);
          document.documentElement.setAttribute('data-font-size', size);
        }}
        onClearHistory={() => {
          setChats([]);
          localStorage.removeItem('nyra_chats');
          if (user?.id) {
            clearAllUserConversations(user.id);
          }
          handleNewChat();
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        messages={messages}
        chatTitle={currentChat?.title || 'Nyra Conversation'}
      />

      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onTranscript={(text) => {
          setInput(text);
          setIsVoiceModeOpen(false);
        }}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        chats={chats}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={handleToggleBookmark}
        onNavigateToMessage={handleNavigateToFavoriteMessage}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
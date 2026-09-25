export type AIMode = 'fast' | 'reasoning' | 'code' | 'vision' | 'web' | 'research';
export type { ChatAttachment } from './multimodal/contract';

export interface WebSource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
}

export type FileAttachmentStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'failed';

export interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'text' | 'file';
  size?: number;
  dataUrl?: string;
  url?: string;
  extractedText?: string;
  pages?: number;
  status?: FileAttachmentStatus;
  errorMessage?: string;
  fileRef?: File;
}

export interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  images?: string[];
  pdfName?: string;
  pdfPages?: number;
  pdfContext?: string;
  attachments?: FileAttachment[];
  timestamp: number;
  parentId?: string;
  branchId?: string;
  branchPointMsgId?: string;
  sources?: WebSource[];
  suggestedFollowUps?: string[];
  status?: 'sent' | 'streaming' | 'error';
  modelId?: string;
  mode?: AIMode;
  toolCalls?: ToolCallRecord[];
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  category?: string;
  tags?: string[];
  reminderTime?: string;
  reminderSent?: boolean;
  roadmapDay?: number;
  roadmapTopic?: string;
  learningFocus?: string;
  chatQuery?: string;
  createdAt: string;
  updatedAt: string;
}

export type MemoryCategory = 'career' | 'goal' | 'preference' | 'project' | 'technical' | 'personal';

export interface MemoryItem {
  id: string;
  title?: string;
  content: string;
  category: MemoryCategory;
  reason?: string;
  confidence?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: 'executing' | 'success' | 'failed';
  message?: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  size: number;
  pages?: number;
  extractedText: string;
  pageMap?: Array<{ pageNumber: number; text: string; charCount: number }>;
  chunksCount: number;
  indexedAt: string;
  summary?: string;
  category?: string;
}

export interface ResearchSession {
  id: string;
  topic: string;
  query?: string;
  synthesis: string;
  questions?: string[];
  sources: WebSource[];
  keyTakeaways?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  projectId?: string;
  title: string;
  messages: Msg[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  branchParentId?: string;
  branchPointMsgId?: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  instructions: string;
  files?: FileAttachment[];
  icon?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  notes?: string;
}

export interface PromptItem {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  content?: string;
  category: string;
  role?: string;
  task?: string;
  context?: string;
  constraints?: string;
  outputFormat?: string;
  tone?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUsedAt?: number;
  usageCount?: number;
  userId?: string;
  isCustom?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  variables?: string[];
}

export interface UserOnboardingPreferences {
  interests: string[];
  goals: string[];
  preferredResponseStyle: string[];
  experienceLevel: 'Beginner' | 'Comfortable' | 'Advanced' | 'Expert' | string;
  customInstructions?: string;
  onboardingCompleted: boolean;
}

export interface UserProfile extends Partial<UserOnboardingPreferences> {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
  theme?: string;
  accentColor?: string;
  fontSize?: string;
  defaultModel?: string;
  interests?: string[];
  goals?: string[];
  preferredResponseStyle?: string[];
  experienceLevel?: 'Beginner' | 'Comfortable' | 'Advanced' | 'Expert' | string;
  customInstructions?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: 'small' | 'normal' | 'large';
  defaultModel: string;
  voiceName?: string;
  voiceRate?: number;
}

export interface UsageRecord {
  id?: string;
  userId: string;
  date: string;
  aiRequests: number;
  webSearches: number;
  imageRequests: number;
  pdfRequests: number;
  inputTokens?: number;
  outputTokens?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyUsageStats {
  date: string;
  aiRequests: { used: number; limit: number };
  webSearches: { used: number; limit: number };
  imageRequests: { used: number; limit: number };
  pdfRequests: { used: number; limit: number };
  isApproachingLimit: boolean;
  isLimitReached: boolean;
}

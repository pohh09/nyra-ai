import { Chat, WorkspaceProject, PromptItem } from './types';

const CHATS_KEY = 'nyra_chats';
const PROJECTS_KEY = 'nyra_projects';
const ACTIVE_PROJECT_KEY = 'nyra_active_project_id';

export const saveChats = (chats: Chat[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    }
  } catch (e) {
    console.error('Failed to save chats:', e);
  }
};

export const loadChats = (): Chat[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CHATS_KEY) || localStorage.getItem('ai_chats');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveProjects = (projects: WorkspaceProject[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
};

export const loadProjects = (): WorkspaceProject[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getActiveProjectId = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
};

export const setActiveProjectId = (id: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    }
  } catch (e) {
    console.error('Failed to set active project:', e);
  }
};

const PROMPTS_KEY = 'nyra_prompts';
const LEGACY_PROMPTS_KEY = 'nyra_custom_prompts';
const RECENT_PROMPTS_KEY = 'nyra_recent_prompts';

export const saveCustomPrompts = (prompts: PromptItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
    }
  } catch (e) {
    console.error('Failed to save prompts:', e);
  }
};

export const loadCustomPrompts = (): PromptItem[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(PROMPTS_KEY) || localStorage.getItem(LEGACY_PROMPTS_KEY);
    if (!raw) return [];
    const parsed: PromptItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure only genuine user-created prompts are returned (filter out legacy built-in/seeded prompts)
    return parsed.filter(
      (p) =>
        p &&
        p.isCustom !== false &&
        !['p1', 'p2', 'p3', 'p4', 'b1', 'b2', 'b3', 'b4'].includes(p.id)
    );
  } catch {
    return [];
  }
};

export const saveRecentPrompts = (prompts: PromptItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(RECENT_PROMPTS_KEY, JSON.stringify(prompts.slice(0, 20)));
    }
  } catch (e) {
    console.error('Failed to save recent prompts:', e);
  }
};

export const loadRecentPrompts = (): PromptItem[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(RECENT_PROMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
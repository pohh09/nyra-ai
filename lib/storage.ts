import { Chat, WorkspaceProject, PromptItem } from './types';

function getChatKey(userId?: string | null): string {
  if (userId) return `nyra_chats_${userId}`;
  if (typeof window !== 'undefined' && localStorage.getItem('nyra_is_guest') === 'true') {
    return 'nyra_chats_guest';
  }
  return 'nyra_chats';
}

function getProjectsKey(userId?: string | null): string {
  return userId ? `nyra_projects_${userId}` : 'nyra_projects';
}

function getActiveProjectKey(userId?: string | null): string {
  return userId ? `nyra_active_project_${userId}` : 'nyra_active_project_id';
}

function getPromptsKey(userId?: string | null): string {
  return userId ? `nyra_prompts_${userId}` : 'nyra_prompts';
}

function getRecentPromptsKey(userId?: string | null): string {
  return userId ? `nyra_recent_prompts_${userId}` : 'nyra_recent_prompts';
}

export const saveChats = (chats: Chat[], userId?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      const key = getChatKey(userId);
      localStorage.setItem(key, JSON.stringify(chats));
    }
  } catch (e) {
    console.error('Failed to save chats:', e);
  }
};

export const loadChats = (userId?: string | null): Chat[] => {
  try {
    if (typeof window === 'undefined') return [];
    const key = getChatKey(userId);
    const raw = localStorage.getItem(key) || (userId ? null : localStorage.getItem('ai_chats'));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearAllChats = (userId?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith('nyra_chats') ||
            k === 'ai_chats' ||
            k.startsWith('nyra_share_') ||
            k === 'nyra_current_chat_id' ||
            k === 'nyra_active_chat_id' ||
            k === 'nyra_pinned_chats' ||
            k === 'nyra_bookmarked_ids')
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      try {
        sessionStorage.removeItem('nyra_initial_prompt');
      } catch {}

      // Explicitly set active key and fallback keys to empty arrays
      if (userId) {
        localStorage.setItem(`nyra_chats_${userId}`, JSON.stringify([]));
      }
      localStorage.setItem('nyra_chats_guest', JSON.stringify([]));
      localStorage.setItem('nyra_chats', JSON.stringify([]));
    }
  } catch (e) {
    console.error('Failed to clear all chats:', e);
  }
};

export const saveProjects = (projects: WorkspaceProject[], userId?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      const key = getProjectsKey(userId);
      localStorage.setItem(key, JSON.stringify(projects));
    }
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
};

export const loadProjects = (userId?: string | null): WorkspaceProject[] => {
  try {
    if (typeof window === 'undefined') return [];
    const key = getProjectsKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getActiveProjectId = (userId?: string | null): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    const key = getActiveProjectKey(userId);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setActiveProjectId = (id: string | null, userId?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      const key = getActiveProjectKey(userId);
      if (id) {
        localStorage.setItem(key, id);
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('Failed to set active project:', e);
  }
};

export const saveCustomPrompts = (prompts: PromptItem[], userId?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      const key = getPromptsKey(userId);
      localStorage.setItem(key, JSON.stringify(prompts));
    }
  } catch (e) {
    console.error('Failed to save prompts:', e);
  }
};

export const loadCustomPrompts = (userId?: string | null): PromptItem[] => {
  try {
    if (typeof window === 'undefined') return [];
    const key = getPromptsKey(userId);
    const raw = localStorage.getItem(key) || (userId ? null : localStorage.getItem('nyra_custom_prompts'));
    if (!raw) return [];
    const parsed: PromptItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
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

export const saveRecentPrompts = (prompts: PromptItem[], userId?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      const key = getRecentPromptsKey(userId);
      localStorage.setItem(key, JSON.stringify(prompts.slice(0, 20)));
    }
  } catch (e) {
    console.error('Failed to save recent prompts:', e);
  }
};

export const loadRecentPrompts = (userId?: string | null): PromptItem[] => {
  try {
    if (typeof window === 'undefined') return [];
    const key = getRecentPromptsKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
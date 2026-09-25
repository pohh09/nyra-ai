'use client';

import { MemoryItem, MemoryCategory } from '@/lib/types';
import {
  fetchCloudMemories,
  saveCloudMemory,
  updateCloudMemory,
  deleteCloudMemory,
  clearAllUserMemories,
  migrateLocalMemoriesToCloud,
} from '@/lib/supabase/chatService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const MEMORY_STORAGE_KEY = 'nyra_memories';
const MEMORY_MASTER_ENABLED_KEY = 'nyra_memory_master_enabled';

const DEFAULT_STARTER_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_starter_career',
    title: 'Career',
    content: 'Full Stack Developer',
    category: 'career',
    reason: 'Shared during introductions so NYRA can tailor coding and architecture answers',
    confidence: 1.0,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_starter_goal',
    title: 'Goal',
    content: 'Learning AI development and building modern web apps',
    category: 'goal',
    reason: 'Saved to provide beginner-friendly AI explanations and step-by-step guidance',
    confidence: 1.0,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_starter_pref',
    title: 'Coding Style',
    content: 'Prefers concise TypeScript solutions with clean modular structure and practical examples',
    category: 'preference',
    reason: 'Saved from your response style preferences',
    confidence: 0.98,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_starter_project',
    title: 'Current Project',
    content: 'Building NYRA AI Workspace with Next.js and Tailwind CSS',
    category: 'project',
    reason: 'Mentioned while working on project features',
    confidence: 1.0,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

let cachedUserId: string | null = null;

function getStorageKey(userId?: string | null): string {
  const uid = userId || cachedUserId;
  return uid ? `nyra_memories_${uid}` : MEMORY_STORAGE_KEY;
}

async function getAuthUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (!isSupabaseConfigured()) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      cachedUserId = session.user.id;
      return cachedUserId;
    }
  } catch {
    // Ignore auth lookup failure
  }
  return null;
}

export function setMemoryActiveUser(userId: string | null): void {
  cachedUserId = userId;
}

export function isMemoryMasterEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(MEMORY_MASTER_ENABLED_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setMemoryMasterEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_MASTER_ENABLED_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('nyra_memory_master_toggled', { detail: enabled }));
  } catch (err) {
    console.error('Failed to save memory master toggle:', err);
  }
}

export function getMemories(userId?: string): MemoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_STARTER_MEMORIES));
      return DEFAULT_STARTER_MEMORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter((m): m is MemoryItem => Boolean(m && typeof m === 'object' && m.id && m.content));
      return valid.length > 0 ? valid : DEFAULT_STARTER_MEMORIES;
    }
    return DEFAULT_STARTER_MEMORIES;
  } catch (err) {
    console.error('Failed to load memories from storage:', err);
    return DEFAULT_STARTER_MEMORIES;
  }
}

export function saveMemories(memories: MemoryItem[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userId);
    const safeMemories = Array.isArray(memories)
      ? memories.filter((m): m is MemoryItem => Boolean(m && typeof m === 'object' && m.id && m.content))
      : [];
    localStorage.setItem(key, JSON.stringify(safeMemories));
    window.dispatchEvent(new CustomEvent('nyra_memories_updated', { detail: safeMemories }));
  } catch (err) {
    console.error('Failed to save memories to storage:', err);
  }
}

export async function syncMemoriesWithCloud(userId: string): Promise<MemoryItem[]> {
  if (!userId || !isSupabaseConfigured()) {
    return getMemories(userId);
  }

  cachedUserId = userId;

  try {
    const cloudMemories = await fetchCloudMemories(userId);
    if (cloudMemories && cloudMemories.length > 0) {
      saveMemories(cloudMemories, userId);
      return cloudMemories;
    }

    // Cloud is empty for this user: migrate local starter memories
    const local = getMemories(userId);
    if (local.length > 0) {
      await migrateLocalMemoriesToCloud(userId, local);
    }
    return local;
  } catch (err) {
    console.error('Failed to sync memories with Supabase:', err);
    return getMemories(userId);
  }
}

export function createMemory(params: {
  title?: string;
  content: string;
  category?: MemoryCategory;
  reason?: string;
  confidence?: number;
}, userId?: string): MemoryItem {
  const current = getMemories(userId);
  const newMemory: MemoryItem = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: params.title?.trim() || undefined,
    content: params.content.trim(),
    category: params.category || 'preference',
    reason: params.reason?.trim() || 'Added manually by you',
    confidence: params.confidence || 1.0,
    enabled: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newMemory, ...current];
  saveMemories(updated, userId);

  // Sync to Supabase in the background if authenticated
  const targetUid = userId || cachedUserId;
  if (targetUid) {
    saveCloudMemory(targetUid, newMemory).catch((e) => console.warn('Cloud memory save error:', e));
  } else {
    getAuthUserId().then((uid) => {
      if (uid) saveCloudMemory(uid, newMemory).catch((e) => console.warn('Cloud memory save error:', e));
    });
  }

  return newMemory;
}

export function updateMemory(
  id: string,
  updates: Partial<Omit<MemoryItem, 'id' | 'createdAt'>>,
  userId?: string
): MemoryItem | null {
  const current = getMemories(userId);
  let updatedMem: MemoryItem | null = null;

  const updatedList = current.map((m) => {
    if (m.id === id) {
      updatedMem = {
        ...m,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedMem;
    }
    return m;
  });

  if (updatedMem) {
    saveMemories(updatedList, userId);

    // Sync to Supabase in the background if authenticated
    const targetUid = userId || cachedUserId;
    if (targetUid) {
      updateCloudMemory(targetUid, id, updates).catch((e) => console.warn('Cloud memory update error:', e));
    } else {
      getAuthUserId().then((uid) => {
        if (uid) updateCloudMemory(uid, id, updates).catch((e) => console.warn('Cloud memory update error:', e));
      });
    }
  }

  return updatedMem;
}

export function deleteMemory(id: string, userId?: string): boolean {
  const current = getMemories(userId);
  const filtered = current.filter((m) => m.id !== id);
  if (filtered.length !== current.length) {
    saveMemories(filtered, userId);

    // Sync to Supabase in the background if authenticated
    const targetUid = userId || cachedUserId;
    if (targetUid) {
      deleteCloudMemory(targetUid, id).catch((e) => console.warn('Cloud memory delete error:', e));
    } else {
      getAuthUserId().then((uid) => {
        if (uid) deleteCloudMemory(uid, id).catch((e) => console.warn('Cloud memory delete error:', e));
      });
    }

    return true;
  }
  return false;
}

export function toggleMemory(id: string, userId?: string): MemoryItem | null {
  const current = getMemories(userId);
  const mem = current.find((m) => m.id === id);
  if (!mem) return null;

  return updateMemory(id, { enabled: !mem.enabled }, userId);
}

export function clearAllMemories(userId?: string): void {
  saveMemories([], userId);

  const targetUid = userId || cachedUserId;
  if (targetUid) {
    clearAllUserMemories(targetUid).catch((e) => console.warn('Cloud memory clear error:', e));
  } else {
    getAuthUserId().then((uid) => {
      if (uid) clearAllUserMemories(uid).catch((e) => console.warn('Cloud memory clear error:', e));
    });
  }
}

export function resetDefaultMemories(userId?: string): MemoryItem[] {
  saveMemories(DEFAULT_STARTER_MEMORIES, userId);

  const targetUid = userId || cachedUserId;
  if (targetUid) {
    migrateLocalMemoriesToCloud(targetUid, DEFAULT_STARTER_MEMORIES).catch((e) =>
      console.warn('Cloud memory reset error:', e)
    );
  } else {
    getAuthUserId().then((uid) => {
      if (uid) {
        migrateLocalMemoriesToCloud(uid, DEFAULT_STARTER_MEMORIES).catch((e) =>
          console.warn('Cloud memory reset error:', e)
        );
      }
    });
  }

  return DEFAULT_STARTER_MEMORIES;
}

export function formatMemoriesForPrompt(userId?: string): string {
  if (!isMemoryMasterEnabled()) return '';
  const memories = getMemories(userId).filter((m) => m.enabled);
  if (memories.length === 0) return '';

  const bulletList = memories
    .map((m) => {
      const topicLabel = m.title || m.category;
      return `- [${topicLabel.toUpperCase()}]: ${m.content}`;
    })
    .join('\n');

  return `### Stored User Information & Context:\n${bulletList}\nUse this remembered context to personalize your assistance for the user.`;
}

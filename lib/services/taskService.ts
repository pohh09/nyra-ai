'use client';

import { TaskItem, TaskPriority, TaskStatus } from '@/lib/types';
import {
  fetchCloudTasks,
  saveCloudTask,
  updateCloudTask,
  deleteCloudTask,
  migrateLocalTasksToCloud,
} from '@/lib/supabase/chatService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const TASKS_STORAGE_KEY = 'nyra_tasks';

const DEFAULT_STARTER_TASKS: TaskItem[] = [
  {
    id: 'task_starter_1',
    title: 'Explore Nyra Workspace Capabilities',
    description: 'Try out RAG document intelligence, AI tool calling, and personal memory.',
    priority: 'high',
    status: 'in_progress',
    category: 'Work',
    tags: ['Nyra', 'AI', 'Onboarding'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_starter_2',
    title: 'Upload and analyze project documentation PDF',
    description: 'Use the Documents workspace to index PDF chunks and ask targeted questions.',
    priority: 'medium',
    status: 'todo',
    category: 'Research',
    tags: ['PDF', 'RAG'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_starter_3',
    title: 'Review React TypeScript Architecture',
    description: 'Ask Nyra to review component structure and hook patterns in Chat UI.',
    priority: 'low',
    status: 'completed',
    category: 'Development',
    tags: ['Coding', 'Architecture'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let cachedUserId: string | null = null;

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

export function setTaskActiveUser(userId: string | null): void {
  cachedUserId = userId;
}

export function getTasks(): TaskItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(DEFAULT_STARTER_TASKS));
      return DEFAULT_STARTER_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((t): t is TaskItem => Boolean(t && typeof t === 'object' && t.id && t.title));
      return valid;
    }
    return DEFAULT_STARTER_TASKS;
  } catch (err) {
    console.error('Failed to load tasks from storage:', err);
    return DEFAULT_STARTER_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const safeTasks = Array.isArray(tasks)
      ? tasks.filter((t): t is TaskItem => Boolean(t && typeof t === 'object' && t.id && t.title))
      : [];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(safeTasks));
    window.dispatchEvent(new CustomEvent('nyra_tasks_updated', { detail: safeTasks }));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export async function syncTasksWithCloud(userId: string): Promise<TaskItem[]> {
  if (!userId || !isSupabaseConfigured()) {
    return getTasks();
  }

  cachedUserId = userId;

  try {
    const cloudTasks = await fetchCloudTasks(userId);
    if (cloudTasks && cloudTasks.length > 0) {
      saveTasks(cloudTasks);
      return cloudTasks;
    }

    // Cloud is empty for this user: if we have starter/local tasks, migrate them to cloud
    const local = getTasks();
    if (local.length > 0) {
      await migrateLocalTasksToCloud(userId, local);
    }
    return local;
  } catch (err) {
    console.error('Failed to sync tasks with Supabase:', err);
    return getTasks();
  }
}

export function createTask(params: {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  reminderTime?: string;
  reminderSent?: boolean;
  roadmapDay?: number;
  roadmapTopic?: string;
  learningFocus?: string;
  chatQuery?: string;
  category?: string;
  tags?: string[];
}, userId?: string): TaskItem {
  const current = getTasks();
  const newTask: TaskItem = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: params.title.trim() || 'Untitled Task',
    description: params.description?.trim(),
    priority: (params.priority === 'low' || params.priority === 'high') ? params.priority : 'medium',
    status: (params.status === 'in_progress' || params.status === 'completed') ? params.status : 'todo',
    dueDate: params.dueDate,
    reminderTime: params.reminderTime,
    reminderSent: params.reminderSent || false,
    roadmapDay: params.roadmapDay,
    roadmapTopic: params.roadmapTopic,
    learningFocus: params.learningFocus,
    chatQuery: params.chatQuery,
    category: params.category?.trim() || 'General',
    tags: Array.isArray(params.tags) ? params.tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newTask, ...current];
  saveTasks(updated);

  // Sync to Supabase in the background if authenticated
  const targetUid = userId || cachedUserId;
  if (targetUid) {
    saveCloudTask(targetUid, newTask).catch((e) => console.warn('Cloud task save error:', e));
  } else {
    getAuthUserId().then((uid) => {
      if (uid) saveCloudTask(uid, newTask).catch((e) => console.warn('Cloud task save error:', e));
    });
  }

  return newTask;
}

export function updateTask(
  id: string,
  updates: Partial<Omit<TaskItem, 'id' | 'createdAt'>>,
  userId?: string
): TaskItem | null {
  const current = getTasks();
  let updatedTask: TaskItem | null = null;

  const updatedList = current.map((t) => {
    if (t.id === id) {
      updatedTask = {
        ...t,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(updatedList);

    // Sync to Supabase in the background if authenticated
    const targetUid = userId || cachedUserId;
    if (targetUid) {
      updateCloudTask(targetUid, id, updates).catch((e) => console.warn('Cloud task update error:', e));
    } else {
      getAuthUserId().then((uid) => {
        if (uid) updateCloudTask(uid, id, updates).catch((e) => console.warn('Cloud task update error:', e));
      });
    }
  }

  return updatedTask;
}

export function deleteTask(id: string, userId?: string): boolean {
  const current = getTasks();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length !== current.length) {
    saveTasks(filtered);

    // Sync to Supabase in the background if authenticated
    const targetUid = userId || cachedUserId;
    if (targetUid) {
      deleteCloudTask(targetUid, id).catch((e) => console.warn('Cloud task delete error:', e));
    } else {
      getAuthUserId().then((uid) => {
        if (uid) deleteCloudTask(uid, id).catch((e) => console.warn('Cloud task delete error:', e));
      });
    }

    return true;
  }
  return false;
}

export function toggleTaskStatus(id: string, userId?: string): TaskItem | null {
  const current = getTasks();
  const task = current.find((t) => t.id === id);
  if (!task) return null;

  const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
  return updateTask(id, { status: nextStatus }, userId);
}

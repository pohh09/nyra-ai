import { supabase, isSupabaseConfigured } from './client';
import { Chat, Msg, PromptItem, TaskItem, MemoryItem } from '@/lib/types';
import { sanitizeAttachmentForStorage } from '@/lib/fileHandling';

export async function fetchCloudConversations(userId: string): Promise<Chat[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  try {
    // 1. Fetch conversations
    const { data: convos, error: convosErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (convosErr || !convos) {
      console.warn('Failed to fetch cloud conversations:', convosErr);
      return [];
    }

    if (convos.length === 0) return [];

    // 2. Fetch all messages for these conversations
    const convoIds = convos.map((c) => c.id);
    const { data: msgs, error: msgsErr } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convoIds)
      .order('timestamp', { ascending: true });

    if (msgsErr) {
      console.warn('Failed to fetch cloud messages:', msgsErr);
    }

    const messagesByConvo: Record<string, Msg[]> = {};
    (msgs || []).forEach((m) => {
      if (!messagesByConvo[m.conversation_id]) {
        messagesByConvo[m.conversation_id] = [];
      }
      messagesByConvo[m.conversation_id].push({
        id: m.id,
        role: m.role,
        content: m.content || '',
        image: m.image || undefined,
        images: m.images ? (typeof m.images === 'string' ? JSON.parse(m.images) : m.images) : undefined,
        pdfName: m.pdf_name || undefined,
        pdfPages: m.pdf_pages || undefined,
        attachments: m.attachments ? (typeof m.attachments === 'string' ? JSON.parse(m.attachments) : m.attachments) : undefined,
        sources: m.sources ? (typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources) : undefined,
        suggestedFollowUps: m.suggested_follow_ups ? (typeof m.suggested_follow_ups === 'string' ? JSON.parse(m.suggested_follow_ups) : m.suggested_follow_ups) : undefined,
        modelId: m.model_id || undefined,
        timestamp: Number(m.timestamp),
      });
    });

    return convos.map((c) => ({
      id: c.id,
      projectId: c.project_id || undefined,
      title: c.title,
      pinned: c.pinned || false,
      archived: c.archived || false,
      branchParentId: c.branch_parent_id || undefined,
      branchPointMsgId: c.branch_point_msg_id || undefined,
      createdAt: Number(c.created_at),
      updatedAt: Number(c.updated_at),
      messages: messagesByConvo[c.id] || [],
    }));
  } catch (err) {
    console.error('Error fetching cloud conversations:', err);
    return [];
  }
}

export async function saveCloudConversation(userId: string, chat: Chat): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase.from('conversations').upsert({
      id: chat.id,
      user_id: userId,
      project_id: chat.projectId || null,
      title: chat.title,
      pinned: chat.pinned || false,
      archived: chat.archived || false,
      branch_parent_id: chat.branchParentId || null,
      branch_point_msg_id: chat.branchPointMsgId || null,
      created_at: chat.createdAt,
      updated_at: chat.updatedAt || Date.now(),
    });

    if (error) {
      console.warn('Failed to save cloud conversation:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving cloud conversation:', err);
    return false;
  }
}

export async function saveCloudMessage(userId: string, conversationId: string, message: Msg): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const sanitizedAttachments = message.attachments
      ? message.attachments.map(sanitizeAttachmentForStorage)
      : null;

    const { error } = await supabase.from('messages').upsert({
      id: message.id,
      conversation_id: conversationId,
      user_id: userId,
      role: message.role,
      content: message.content,
      image: message.image || null,
      images: message.images ? JSON.stringify(message.images) : null,
      pdf_name: message.pdfName || null,
      pdf_pages: message.pdfPages || null,
      attachments: sanitizedAttachments ? JSON.stringify(sanitizedAttachments) : null,
      sources: message.sources ? JSON.stringify(message.sources) : null,
      suggested_follow_ups: message.suggestedFollowUps ? JSON.stringify(message.suggestedFollowUps) : null,
      model_id: message.modelId || null,
      timestamp: message.timestamp || Date.now(),
    });

    if (error) {
      console.warn('Failed to save cloud message:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving cloud message:', err);
    return false;
  }
}

export async function updateCloudConversationTitle(userId: string, conversationId: string, title: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: Date.now() })
      .eq('id', conversationId)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCloudConversation(userId: string, conversationId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function togglePinCloudConversation(userId: string, conversationId: string, pinned: boolean): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ pinned, updated_at: Date.now() })
      .eq('id', conversationId)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function toggleArchiveCloudConversation(userId: string, conversationId: string, archived: boolean): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ archived, updated_at: Date.now() })
      .eq('id', conversationId)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function clearAllUserConversations(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function migrateLocalChatsToCloud(userId: string, localChats: Chat[]): Promise<{ migrated: number; error?: string }> {
  if (!isSupabaseConfigured() || !userId || !localChats || localChats.length === 0) {
    return { migrated: 0 };
  }

  try {
    let count = 0;
    for (const chat of localChats) {
      const ok = await saveCloudConversation(userId, chat);
      if (ok && chat.messages && chat.messages.length > 0) {
        for (const msg of chat.messages) {
          await saveCloudMessage(userId, chat.id, msg);
        }
        count++;
      }
    }
    return { migrated: count };
  } catch (err: any) {
    return { migrated: 0, error: err?.message || 'Migration failed' };
  }
}

export async function fetchCloudPrompts(userId: string): Promise<PromptItem[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      prompt: p.prompt,
      content: p.content || undefined,
      category: p.category || 'general',
      isCustom: p.is_custom,
      isFavorite: p.is_favorite,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function saveCloudPrompt(userId: string, prompt: PromptItem): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase.from('prompts').upsert({
      id: prompt.id,
      user_id: userId,
      title: prompt.title,
      prompt: prompt.prompt,
      content: prompt.content || null,
      category: prompt.category || 'general',
      is_custom: prompt.isCustom ?? true,
      is_favorite: prompt.isFavorite ?? false,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCloudPrompt(userId: string, promptId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

// =========================================================
// TASKS CLOUD PERSISTENCE
// =========================================================

function toSafeIsoDate(val?: string | null): string | null {
  if (!val) return null;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

export async function fetchCloudTasks(userId: string): Promise<TaskItem[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Failed to fetch cloud tasks:', error);
      return [];
    }

    return data.map((t) => {
      let parsedTags: string[] = [];
      if (Array.isArray(t.tags)) {
        parsedTags = t.tags;
      } else if (typeof t.tags === 'string') {
        try {
          const parsed = JSON.parse(t.tags);
          parsedTags = Array.isArray(parsed) ? parsed : [];
        } catch {
          parsedTags = [];
        }
      }

      return {
        id: t.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: t.title || 'Untitled Task',
        description: t.description || undefined,
        priority: (t.priority === 'low' || t.priority === 'high') ? t.priority : 'medium',
        status: (t.status === 'in_progress' || t.status === 'completed') ? t.status : 'todo',
        dueDate: t.due_date || undefined,
        reminderTime: t.reminder_time || undefined,
        reminderSent: t.reminder_sent || false,
        roadmapDay: t.roadmap_day || undefined,
        roadmapTopic: t.roadmap_topic || undefined,
        learningFocus: t.learning_focus || undefined,
        chatQuery: t.chat_query || undefined,
        category: t.category || 'General',
        tags: parsedTags,
        createdAt: t.created_at || new Date().toISOString(),
        updatedAt: t.updated_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Error fetching cloud tasks:', err);
    return [];
  }
}

export async function saveCloudTask(userId: string, task: TaskItem): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId || !task) return false;
  try {
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      title: task.title || 'Untitled Task',
      description: task.description || null,
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      due_date: toSafeIsoDate(task.dueDate),
      reminder_time: toSafeIsoDate(task.reminderTime),
      reminder_sent: task.reminderSent || false,
      roadmap_day: task.roadmapDay || null,
      roadmap_topic: task.roadmapTopic || null,
      learning_focus: task.learningFocus || null,
      chat_query: task.chatQuery || null,
      category: task.category || 'General',
      tags: Array.isArray(task.tags) ? task.tags : [],
      created_at: toSafeIsoDate(task.createdAt) || new Date().toISOString(),
      updated_at: toSafeIsoDate(task.updatedAt) || new Date().toISOString(),
    });

    if (error) {
      console.warn('Failed to save cloud task:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving cloud task:', err);
    return false;
  }
}

export async function updateCloudTask(
  userId: string,
  taskId: string,
  updates: Partial<TaskItem>
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId || !taskId) return false;
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.dueDate !== undefined) payload.due_date = toSafeIsoDate(updates.dueDate);
    if (updates.reminderTime !== undefined) payload.reminder_time = toSafeIsoDate(updates.reminderTime);
    if (updates.reminderSent !== undefined) payload.reminder_sent = updates.reminderSent;
    if (updates.roadmapDay !== undefined) payload.roadmap_day = updates.roadmapDay || null;
    if (updates.roadmapTopic !== undefined) payload.roadmap_topic = updates.roadmapTopic || null;
    if (updates.learningFocus !== undefined) payload.learning_focus = updates.learningFocus || null;
    if (updates.chatQuery !== undefined) payload.chat_query = updates.chatQuery || null;
    if (updates.category !== undefined) payload.category = updates.category || 'General';
    if (updates.tags !== undefined) payload.tags = Array.isArray(updates.tags) ? updates.tags : [];

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error updating cloud task:', err);
    return false;
  }
}

export async function deleteCloudTask(userId: string, taskId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error deleting cloud task:', err);
    return false;
  }
}

export async function migrateLocalTasksToCloud(
  userId: string,
  localTasks: TaskItem[]
): Promise<{ migrated: number; error?: string }> {
  if (!isSupabaseConfigured() || !userId || !localTasks || localTasks.length === 0) {
    return { migrated: 0 };
  }

  try {
    let count = 0;
    for (const task of localTasks) {
      const ok = await saveCloudTask(userId, task);
      if (ok) count++;
    }
    return { migrated: count };
  } catch (err: any) {
    return { migrated: 0, error: err?.message || 'Task migration failed' };
  }
}

// =========================================================
// AI MEMORIES CLOUD PERSISTENCE
// =========================================================

export async function fetchCloudMemories(userId: string): Promise<MemoryItem[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Failed to fetch cloud memories:', error);
      return [];
    }

    return data.map((m) => ({
      id: m.id,
      title: m.title || undefined,
      content: m.content || '',
      category: m.category || 'preference',
      reason: m.reason || undefined,
      confidence: m.confidence !== null && m.confidence !== undefined ? Number(m.confidence) : 1.0,
      enabled: m.enabled ?? true,
      createdAt: m.created_at || new Date().toISOString(),
      updatedAt: m.updated_at || undefined,
    }));
  } catch (err) {
    console.error('Error fetching cloud memories:', err);
    return [];
  }
}

export async function saveCloudMemory(userId: string, memory: MemoryItem): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase.from('memories').upsert({
      id: memory.id,
      user_id: userId,
      title: memory.title || null,
      content: memory.content,
      category: memory.category || 'preference',
      reason: memory.reason || null,
      confidence: memory.confidence ?? 1.0,
      enabled: memory.enabled ?? true,
      created_at: memory.createdAt || new Date().toISOString(),
      updated_at: memory.updatedAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('Failed to save cloud memory:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving cloud memory:', err);
    return false;
  }
}

export async function updateCloudMemory(
  userId: string,
  memoryId: string,
  updates: Partial<MemoryItem>
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title || null;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.reason !== undefined) payload.reason = updates.reason || null;
    if (updates.confidence !== undefined) payload.confidence = updates.confidence;
    if (updates.enabled !== undefined) payload.enabled = updates.enabled;

    const { error } = await supabase
      .from('memories')
      .update(payload)
      .eq('id', memoryId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error updating cloud memory:', err);
    return false;
  }
}

export async function deleteCloudMemory(userId: string, memoryId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error deleting cloud memory:', err);
    return false;
  }
}

export async function clearAllUserMemories(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;
  try {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error clearing cloud memories:', err);
    return false;
  }
}

export async function migrateLocalMemoriesToCloud(
  userId: string,
  localMemories: MemoryItem[]
): Promise<{ migrated: number; error?: string }> {
  if (!isSupabaseConfigured() || !userId || !localMemories || localMemories.length === 0) {
    return { migrated: 0 };
  }

  try {
    let count = 0;
    for (const mem of localMemories) {
      const ok = await saveCloudMemory(userId, mem);
      if (ok) count++;
    }
    return { migrated: count };
  } catch (err: any) {
    return { migrated: 0, error: err?.message || 'Memory migration failed' };
  }
}


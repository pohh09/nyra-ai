'use client';

import { createTask, getTasks, updateTask, toggleTaskStatus } from './taskService';
import { createMemory, getMemories } from './memoryService';
import { ToolCallRecord, TaskPriority, TaskStatus, MemoryCategory } from '@/lib/types';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export const WORKSPACE_TOOLS: ToolDefinition[] = [
  {
    name: 'create_task',
    description: 'Create a new task in the user workspace with priority, category, and due date.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The clear title of the task to create.' },
        description: { type: 'string', description: 'Detailed notes or subtasks.' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Urgency level.' },
        dueDate: { type: 'string', description: 'Due date string or relative date (e.g. tomorrow, 2026-09-01).' },
        category: { type: 'string', description: 'Task category (e.g. Work, Coding, Personal, Research).' },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_tasks',
    description: 'Retrieve current tasks from the workspace, optionally filtered by status.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'todo', 'in_progress', 'completed'], description: 'Filter status.' },
      },
      required: [],
    },
  },
  {
    name: 'save_memory',
    description: 'Store a persistent user preference, skill, project, or personal goal into AI memory.',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The exact preference or fact to remember.' },
        category: {
          type: 'string',
          enum: ['preference', 'technical', 'career', 'personal', 'project'],
          description: 'Memory category.',
        },
      },
      required: ['content'],
    },
  },
];

export function executeWorkspaceTool(
  name: string,
  args: Record<string, any>
): { success: boolean; result: any; message: string } {
  try {
    switch (name) {
      case 'create_task': {
        const title = args.title || 'Untitled Task';
        const priority: TaskPriority = args.priority === 'high' || args.priority === 'low' ? args.priority : 'medium';
        const created = createTask({
          title,
          description: args.description,
          priority,
          dueDate: args.dueDate,
          category: args.category || 'General',
        });
        return {
          success: true,
          result: created,
          message: `Created task: "${created.title}" [${created.priority.toUpperCase()}]`,
        };
      }

      case 'list_tasks': {
        const all = getTasks();
        const filtered = args.status && args.status !== 'all'
          ? all.filter((t) => t.status === args.status)
          : all;
        return {
          success: true,
          result: filtered,
          message: `Found ${filtered.length} task(s)`,
        };
      }

      case 'save_memory': {
        const content = args.content;
        const category: MemoryCategory = args.category || 'preference';
        const created = createMemory({ content, category });
        return {
          success: true,
          result: created,
          message: `Saved to memory: "${created.content}"`,
        };
      }

      default:
        return {
          success: false,
          result: null,
          message: `Unknown tool: ${name}`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      result: null,
      message: err.message || 'Tool execution error',
    };
  }
}

/**
 * Intelligent Tool Extraction from Natural Language
 * Detects intentional tool requests like "create a task...", "remember that..."
 */
export function analyzeIntentForToolCalls(userMessage: string): ToolCallRecord | null {
  const text = userMessage.trim().toLowerCase();

  // 1. Task Creation Intent
  if (
    text.startsWith('create task') ||
    text.startsWith('add task') ||
    text.startsWith('create a task') ||
    text.startsWith('add a task') ||
    text.includes('create a task to') ||
    text.includes('add a task to')
  ) {
    let title = userMessage
      .replace(/^(please\s+)?(can you\s+)?(create|add)(\s+a)?\s+task(\s+to)?\s+/i, '')
      .trim();

    // Priority detection
    let priority: TaskPriority = 'medium';
    if (text.includes('high priority') || text.includes('urgent')) priority = 'high';
    if (text.includes('low priority')) priority = 'low';

    // Due date detection
    let dueDate: string | undefined = undefined;
    if (text.includes('tomorrow')) dueDate = 'Tomorrow';
    if (text.includes('today')) dueDate = 'Today';
    if (text.includes('this week')) dueDate = 'This Week';

    // Clean title
    title = title
      .replace(/\s+(with\s+)?high priority/i, '')
      .replace(/\s+(with\s+)?low priority/i, '')
      .replace(/\s+(due\s+)?tomorrow/i, '')
      .replace(/\s+(due\s+)?today/i, '')
      .trim();

    if (title.length > 2) {
      const executed = executeWorkspaceTool('create_task', {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        priority,
        dueDate,
      });

      return {
        id: `tool_${Date.now()}`,
        name: 'create_task',
        args: { title, priority, dueDate },
        result: executed.result,
        status: executed.success ? 'success' : 'failed',
        message: executed.message,
      };
    }
  }

  // 2. Memory Storage Intent
  if (
    text.startsWith('remember that') ||
    text.startsWith('remember:') ||
    text.startsWith('please remember that') ||
    text.startsWith('save to memory') ||
    text.startsWith('note that i prefer') ||
    text.startsWith('keep in mind that')
  ) {
    const memoryContent = userMessage
      .replace(/^(please\s+)?(remember that|remember:|save to memory|note that|keep in mind that)\s+/i, '')
      .trim();

    let category: MemoryCategory = 'preference';
    if (text.includes('career') || text.includes('job') || text.includes('role')) category = 'career';
    if (text.includes('code') || text.includes('stack') || text.includes('typescript') || text.includes('react')) category = 'technical';
    if (text.includes('project') || text.includes('building')) category = 'project';

    if (memoryContent.length > 3) {
      const executed = executeWorkspaceTool('save_memory', {
        content: memoryContent,
        category,
      });

      return {
        id: `tool_${Date.now()}`,
        name: 'save_memory',
        args: { content: memoryContent, category },
        result: executed.result,
        status: executed.success ? 'success' : 'failed',
        message: executed.message,
      };
    }
  }

  return null;
}

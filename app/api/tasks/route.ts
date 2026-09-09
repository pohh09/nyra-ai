import { NextResponse } from 'next/server';
import { TaskItem } from '@/lib/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// In-memory server task store fallback for unauthenticated / offline requests
let serverTasks: TaskItem[] = [
  {
    id: 'task_demo_1',
    title: 'Review React 19 architecture documentation',
    description: 'Verify server components and hydration patterns.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: 'Development',
    tags: ['React', 'Architecture'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_demo_2',
    title: 'Refactor vector embeddings index for RAG',
    description: 'Ensure 384-dimensional cosine similarity indexing.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    category: 'AI Engine',
    tags: ['RAG', 'Vectors'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const tasks: TaskItem[] = data.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || undefined,
            priority: t.priority || 'medium',
            status: t.status || 'todo',
            dueDate: t.due_date || undefined,
            reminderTime: t.reminder_time || undefined,
            reminderSent: t.reminder_sent || false,
            roadmapDay: t.roadmap_day || undefined,
            roadmapTopic: t.roadmap_topic || undefined,
            learningFocus: t.learning_focus || undefined,
            chatQuery: t.chat_query || undefined,
            category: t.category || 'General',
            tags: Array.isArray(t.tags) ? t.tags : typeof t.tags === 'string' ? JSON.parse(t.tags) : [],
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          }));
          return NextResponse.json({ success: true, tasks });
        }
      }
    }
  } catch (err) {
    console.warn('Supabase task fetch fallback:', err);
  }

  return NextResponse.json({ success: true, tasks: serverTasks });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newTask: TaskItem = {
      id: body.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: body.title.trim(),
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      dueDate: body.dueDate,
      reminderTime: body.reminderTime,
      reminderSent: body.reminderSent || false,
      roadmapDay: body.roadmapDay,
      roadmapTopic: body.roadmapTopic,
      learningFocus: body.learningFocus,
      chatQuery: body.chatQuery,
      category: body.category || 'General',
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('tasks').upsert({
          id: newTask.id,
          user_id: user.id,
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.dueDate || null,
          reminder_time: newTask.reminderTime || null,
          reminder_sent: newTask.reminderSent || false,
          roadmap_day: newTask.roadmapDay || null,
          roadmap_topic: newTask.roadmapTopic || null,
          learning_focus: newTask.learningFocus || null,
          chat_query: newTask.chatQuery || null,
          category: newTask.category,
          tags: newTask.tags,
          created_at: newTask.createdAt,
          updated_at: newTask.updatedAt,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, task: newTask }, { status: 201 });
      }
    }

    serverTasks = [newTask, ...serverTasks];
    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (body.title !== undefined) payload.title = body.title.trim();
        if (body.description !== undefined) payload.description = body.description || null;
        if (body.status !== undefined) payload.status = body.status;
        if (body.priority !== undefined) payload.priority = body.priority;
        if (body.dueDate !== undefined) payload.due_date = body.dueDate || null;
        if (body.reminderTime !== undefined) payload.reminder_time = body.reminderTime || null;
        if (body.reminderSent !== undefined) payload.reminder_sent = body.reminderSent;
        if (body.roadmapDay !== undefined) payload.roadmap_day = body.roadmapDay || null;
        if (body.roadmapTopic !== undefined) payload.roadmap_topic = body.roadmapTopic || null;
        if (body.learningFocus !== undefined) payload.learning_focus = body.learningFocus || null;
        if (body.chatQuery !== undefined) payload.chat_query = body.chatQuery || null;
        if (body.category !== undefined) payload.category = body.category;
        if (body.tags !== undefined) payload.tags = body.tags;

        const { data, error } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', body.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const task: TaskItem = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          priority: data.priority,
          status: data.status,
          dueDate: data.due_date || undefined,
          reminderTime: data.reminder_time || undefined,
          reminderSent: data.reminder_sent || false,
          roadmapDay: data.roadmap_day || undefined,
          roadmapTopic: data.roadmap_topic || undefined,
          learningFocus: data.learning_focus || undefined,
          chatQuery: data.chat_query || undefined,
          category: data.category,
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        return NextResponse.json({ success: true, task });
      }
    }

    let foundTask: TaskItem | null = null;
    serverTasks = serverTasks.map((t: TaskItem): TaskItem => {
      if (t.id === body.id) {
        const updated: TaskItem = {
          ...t,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        foundTask = updated;
        return updated;
      }
      return t;
    });

    if (!foundTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: foundTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, deletedId: id });
      }
    }

    serverTasks = serverTasks.filter((t) => t.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

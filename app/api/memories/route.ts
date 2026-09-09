import { NextResponse } from 'next/server';
import { MemoryItem } from '@/lib/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

let serverMemories: MemoryItem[] = [
  {
    id: 'mem_1',
    content: 'Prefers TypeScript with strict typing and Next.js App Router patterns.',
    category: 'technical',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_2',
    content: 'Values clean code, concise explanations, and production-ready designs.',
    category: 'preference',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const memories: MemoryItem[] = data.map((m) => ({
            id: m.id,
            title: m.title || undefined,
            content: m.content || '',
            category: m.category || 'preference',
            reason: m.reason || undefined,
            confidence: m.confidence !== null && m.confidence !== undefined ? Number(m.confidence) : 1.0,
            enabled: m.enabled ?? true,
            createdAt: m.created_at,
            updatedAt: m.updated_at || undefined,
          }));
          return NextResponse.json({ success: true, memories });
        }
      }
    }
  } catch (err) {
    console.warn('Supabase memory fetch fallback:', err);
  }

  return NextResponse.json({ success: true, memories: serverMemories });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.content) {
      return NextResponse.json({ error: 'Memory content is required' }, { status: 400 });
    }

    const newMemory: MemoryItem = {
      id: body.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: body.title?.trim() || undefined,
      content: body.content.trim(),
      category: body.category || 'preference',
      reason: body.reason?.trim() || undefined,
      confidence: body.confidence ?? 1.0,
      enabled: body.enabled ?? true,
      createdAt: new Date().toISOString(),
    };

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('memories').upsert({
          id: newMemory.id,
          user_id: user.id,
          title: newMemory.title || null,
          content: newMemory.content,
          category: newMemory.category,
          reason: newMemory.reason || null,
          confidence: newMemory.confidence,
          enabled: newMemory.enabled,
          created_at: newMemory.createdAt,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, memory: newMemory }, { status: 201 });
      }
    }

    serverMemories = [newMemory, ...serverMemories];
    return NextResponse.json({ success: true, memory: newMemory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (body.title !== undefined) payload.title = body.title || null;
        if (body.content !== undefined) payload.content = body.content.trim();
        if (body.category !== undefined) payload.category = body.category;
        if (body.reason !== undefined) payload.reason = body.reason || null;
        if (body.confidence !== undefined) payload.confidence = body.confidence;
        if (body.enabled !== undefined) payload.enabled = body.enabled;

        const { data, error } = await supabase
          .from('memories')
          .update(payload)
          .eq('id', body.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const memory: MemoryItem = {
          id: data.id,
          title: data.title || undefined,
          content: data.content,
          category: data.category,
          reason: data.reason || undefined,
          confidence: data.confidence !== null && data.confidence !== undefined ? Number(data.confidence) : 1.0,
          enabled: data.enabled ?? true,
          createdAt: data.created_at,
          updatedAt: data.updated_at || undefined,
        };

        return NextResponse.json({ success: true, memory });
      }
    }

    let foundMemory: MemoryItem | null = null;
    serverMemories = serverMemories.map((m: MemoryItem): MemoryItem => {
      if (m.id === body.id) {
        const updated: MemoryItem = {
          ...m,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        foundMemory = updated;
        return updated;
      }
      return m;
    });

    if (!foundMemory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, memory: foundMemory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('memories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, deletedId: id });
      }
    }

    serverMemories = serverMemories.filter((m) => m.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

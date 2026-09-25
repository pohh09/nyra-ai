import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/auth/adminAuth';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string;
  status: 'active' | 'invited' | 'disabled';
  onboardingCompleted: boolean;
  conversationsCount: number;
  messagesCount: number;
  promptsCount: number;
  tasksCount: number;
  memoriesCount: number;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Authorization Check
    const auth = await verifyAdminUser(request);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'Forbidden: Administrator credentials required' },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const specificUserId = searchParams.get('id');

    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let supabase: any;

    if (supabaseServiceKey) {
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      });
    }

    // Individual User Details Query
    if (specificUserId) {
      const [profileRes, convosRes, msgsRes, promptsRes, tasksRes, memoriesRes, activityRes] =
        await Promise.allSettled([
          supabase.from('profiles').select('*').eq('id', specificUserId).single(),
          supabase.from('conversations').select('id, title, created_at, updated_at').eq('user_id', specificUserId).order('updated_at', { ascending: false }),
          supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', specificUserId),
          supabase.from('prompts').select('id, title, category, created_at').eq('user_id', specificUserId),
          supabase.from('tasks').select('id, title, status, priority, created_at').eq('user_id', specificUserId),
          supabase.from('memories').select('id', { count: 'exact', head: true }).eq('user_id', specificUserId),
          supabase.from('auth_activity').select('*').eq('user_id', specificUserId).order('created_at', { ascending: false }).limit(20),
        ]);

      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const conversations = convosRes.status === 'fulfilled' ? convosRes.value.data || [] : [];
      const messagesCount = msgsRes.status === 'fulfilled' ? msgsRes.value.count || 0 : 0;
      const prompts = promptsRes.status === 'fulfilled' ? promptsRes.value.data || [] : [];
      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data || [] : [];
      const memoriesCount = memoriesRes.status === 'fulfilled' ? memoriesRes.value.count || 0 : 0;
      const recentActivities = activityRes.status === 'fulfilled' ? activityRes.value.data || [] : [];

      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name || profile.email.split('@')[0],
          avatarUrl: profile.avatar_url,
          role: profile.role || 'user',
          experienceLevel: profile.experience_level,
          onboardingCompleted: Boolean(profile.onboarding_completed),
          createdAt: profile.created_at,
          lastActive: profile.updated_at,
          counts: {
            conversations: conversations.length,
            messages: messagesCount,
            prompts: prompts.length,
            tasks: tasks.length,
            memories: memoriesCount,
          },
          conversationsMeta: conversations.slice(0, 10),
          recentActivities,
        },
      });
    }

    // List All Users Query
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 500 });
    }

    // Fetch counts per user in parallel for quick aggregation
    const [convosRes, tasksRes, promptsRes] = await Promise.allSettled([
      supabase.from('conversations').select('user_id'),
      supabase.from('tasks').select('user_id'),
      supabase.from('prompts').select('user_id'),
    ]);

    const convosList = convosRes.status === 'fulfilled' ? convosRes.value.data || [] : [];
    const tasksList = tasksRes.status === 'fulfilled' ? tasksRes.value.data || [] : [];
    const promptsList = promptsRes.status === 'fulfilled' ? promptsRes.value.data || [] : [];

    const convoCountMap: Record<string, number> = {};
    convosList.forEach((c: any) => {
      convoCountMap[c.user_id] = (convoCountMap[c.user_id] || 0) + 1;
    });

    const taskCountMap: Record<string, number> = {};
    tasksList.forEach((t: any) => {
      taskCountMap[t.user_id] = (taskCountMap[t.user_id] || 0) + 1;
    });

    const promptCountMap: Record<string, number> = {};
    promptsList.forEach((p: any) => {
      promptCountMap[p.user_id] = (promptCountMap[p.user_id] || 0) + 1;
    });

    const sanitizedUsers: AdminUserRecord[] = (profiles || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      displayName: p.display_name || p.email.split('@')[0],
      avatarUrl: p.avatar_url,
      provider: 'Supabase Auth',
      role: p.role || 'user',
      createdAt: p.created_at || new Date().toISOString(),
      lastSignInAt: p.updated_at,
      status: 'active',
      onboardingCompleted: Boolean(p.onboarding_completed),
      conversationsCount: convoCountMap[p.id] || 0,
      messagesCount: 0,
      promptsCount: promptCountMap[p.id] || 0,
      tasksCount: taskCountMap[p.id] || 0,
      memoriesCount: 0,
    }));

    return NextResponse.json({
      success: true,
      count: sanitizedUsers.length,
      users: sanitizedUsers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal admin error' },
      { status: 500 }
    );
  }
}

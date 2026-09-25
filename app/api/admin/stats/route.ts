import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/auth/adminAuth';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Authorization Check
    const auth = await verifyAdminUser(request);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.status }
      );
    }

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

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 2. Fetch real stats concurrently
    const [
      profilesRes,
      conversationsRes,
      messagesRes,
      promptsRes,
      tasksRes,
      memoriesRes,
      usageRes,
      activityRes,
    ] = await Promise.allSettled([
      supabase.from('profiles').select('id, created_at, role, updated_at', { count: 'exact' }),
      supabase.from('conversations').select('id, created_at', { count: 'exact' }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('prompts').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id, status', { count: 'exact' }),
      supabase.from('memories').select('id', { count: 'exact', head: true }),
      supabase.from('usage_records').select('*').gte('date', sevenDaysAgo.split('T')[0]),
      supabase.from('auth_activity').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    const profiles = profilesRes.status === 'fulfilled' ? profilesRes.value.data || [] : [];
    const totalUsers = profilesRes.status === 'fulfilled' ? profilesRes.value.count || profiles.length : 0;

    const totalConversations = conversationsRes.status === 'fulfilled' ? conversationsRes.value.count || 0 : 0;
    const totalMessages = messagesRes.status === 'fulfilled' ? messagesRes.value.count || 0 : 0;
    const totalPrompts = promptsRes.status === 'fulfilled' ? promptsRes.value.count || 0 : 0;
    const totalTasks = tasksRes.status === 'fulfilled' ? tasksRes.value.count || 0 : 0;
    const totalMemories = memoriesRes.status === 'fulfilled' ? memoriesRes.value.count || 0 : 0;

    const activities = activityRes.status === 'fulfilled' ? activityRes.value.data || [] : [];

    // New signups
    const signupsToday = profiles.filter((p: any) => p.created_at && p.created_at >= todayStart).length;
    const signups7d = profiles.filter((p: any) => p.created_at && p.created_at >= sevenDaysAgo).length;

    // Active users in 24h
    const activeUserIds24h = new Set<string>();
    profiles.forEach((p: any) => {
      if (p.updated_at && p.updated_at >= twentyFourHoursAgo) activeUserIds24h.add(p.id);
    });
    activities.forEach((a: any) => {
      if (a.user_id && a.created_at >= twentyFourHoursAgo) activeUserIds24h.add(a.user_id);
    });
    const activeUsers24h = activeUserIds24h.size;

    // Guest sessions & messages
    const guestStartedEvents = activities.filter((a: any) => a.event_type === 'guest_started');
    const guestSessions = guestStartedEvents.length;

    // Recent Logins
    const recentLogins = activities
      .filter((a: any) => a.event_type === 'login' || a.event_type === 'google_login')
      .slice(0, 10);

    // Recent activity list
    const recentActivity = activities.slice(0, 25);

    // Feature Usage Breakdown
    const usageRecords = usageRes.status === 'fulfilled' ? usageRes.value.data || [] : [];
    let totalAiRequests = 0;
    let totalWebSearches = 0;
    let totalImageRequests = 0;
    let totalPdfRequests = 0;

    usageRecords.forEach((u: any) => {
      totalAiRequests += u.ai_requests || 0;
      totalWebSearches += u.web_searches || 0;
      totalImageRequests += u.image_requests || 0;
      totalPdfRequests += u.pdf_requests || 0;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        signupsToday,
        signups7d,
        activeUsers24h,
        totalConversations,
        totalMessages,
        totalPrompts,
        totalTasks,
        totalMemories,
        guestSessions,
        totalAiRequests,
        totalWebSearches,
        totalImageRequests,
        totalPdfRequests,
      },
      recentLogins,
      recentActivity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal admin stats error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserTodayUsage } from '@/lib/usage/usageService';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    let userId: string | null = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    const stats = await getUserTodayUsage(supabase, userId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error querying usage:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve usage data.' },
      { status: 500 }
    );
  }
}

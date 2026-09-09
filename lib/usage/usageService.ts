import { SupabaseClient } from '@supabase/supabase-js';
import { USAGE_LIMITS, FeatureType } from './limits';
import { DailyUsageStats } from '@/lib/types';

export async function checkAndIncrementUsage(
  supabaseServer: SupabaseClient | null,
  userId: string | null,
  feature: FeatureType,
  increment: number = 1
): Promise<{ allowed: boolean; current?: number; limit?: number; error?: string }> {
  const isAuth = Boolean(userId && supabaseServer);
  const limits = isAuth ? USAGE_LIMITS.free : USAGE_LIMITS.guest;
  const maxLimit = limits[feature];

  // If Supabase server client and authenticated user are available, enforce atomically via RPC
  if (isAuth && supabaseServer && userId) {
    try {
      const { data, error } = await supabaseServer.rpc('check_and_increment_usage', {
        p_user_id: userId,
        p_feature: feature,
        p_limit: maxLimit,
        p_increment: increment,
      });

      if (error) {
        console.warn('RPC check_and_increment_usage error, fallback to table check:', error);
        // Fallback: query usage table directly
        const today = new Date().toISOString().split('T')[0];
        const { data: record } = await supabaseServer
          .from('usage_records')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        const fieldMap: Record<FeatureType, string> = {
          aiRequests: 'ai_requests',
          webSearches: 'web_searches',
          imageRequests: 'image_requests',
          pdfRequests: 'pdf_requests',
        };
        const dbField = fieldMap[feature];
        const current = record ? (record[dbField] || 0) : 0;

        if (current + increment > maxLimit) {
          return { allowed: false, current, limit: maxLimit };
        }

        // Upsert record
        if (record) {
          await supabaseServer
            .from('usage_records')
            .update({ [dbField]: current + increment, updated_at: new Date().toISOString() })
            .eq('id', record.id);
        } else {
          await supabaseServer
            .from('usage_records')
            .insert({
              user_id: userId,
              date: today,
              [dbField]: increment,
            });
        }
        return { allowed: true, current: current + increment, limit: maxLimit };
      }

      if (data && typeof data === 'object') {
        return {
          allowed: Boolean(data.allowed),
          current: data.current,
          limit: data.limit || maxLimit,
        };
      }
    } catch (err: any) {
      console.warn('Usage check exception:', err);
    }
  }

  // Guest / unconfigured fallback: allow up to guest limits
  return { allowed: true, limit: maxLimit };
}

export async function getUserTodayUsage(
  supabaseServer: SupabaseClient | null,
  userId: string | null
): Promise<DailyUsageStats> {
  const isAuth = Boolean(userId && supabaseServer);
  const limits = isAuth ? USAGE_LIMITS.free : USAGE_LIMITS.guest;
  const today = new Date().toISOString().split('T')[0];

  let aiUsed = 0;
  let webUsed = 0;
  let imgUsed = 0;
  let pdfUsed = 0;

  if (isAuth && supabaseServer && userId) {
    try {
      const { data } = await supabaseServer
        .from('usage_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        aiUsed = data.ai_requests || 0;
        webUsed = data.web_searches || 0;
        imgUsed = data.image_requests || 0;
        pdfUsed = data.pdf_requests || 0;
      }
    } catch (e) {
      console.warn('Failed to fetch user usage:', e);
    }
  }

  const isApproachingLimit =
    aiUsed >= limits.aiRequests * USAGE_LIMITS.warningThreshold ||
    webUsed >= limits.webSearches * USAGE_LIMITS.warningThreshold ||
    imgUsed >= limits.imageRequests * USAGE_LIMITS.warningThreshold ||
    pdfUsed >= limits.pdfRequests * USAGE_LIMITS.warningThreshold;

  const isLimitReached =
    aiUsed >= limits.aiRequests ||
    webUsed >= limits.webSearches ||
    imgUsed >= limits.imageRequests ||
    pdfUsed >= limits.pdfRequests;

  return {
    date: today,
    aiRequests: { used: aiUsed, limit: limits.aiRequests },
    webSearches: { used: webUsed, limit: limits.webSearches },
    imageRequests: { used: imgUsed, limit: limits.imageRequests },
    pdfRequests: { used: pdfUsed, limit: limits.pdfRequests },
    isApproachingLimit,
    isLimitReached,
  };
}

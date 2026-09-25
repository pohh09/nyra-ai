import { DailyUsageStats } from '@/lib/types';
import { USAGE_LIMITS, FeatureType } from './limits';

const LOCAL_USAGE_KEY = 'nyra_daily_usage_v1';

interface StoredUsageRecord {
  date: string;
  aiRequests: number;
  webSearches: number;
  imageRequests: number;
  pdfRequests: number;
}

function getTodayUtcString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getLocalUsageRecord(): StoredUsageRecord {
  const today = getTodayUtcString();
  const defaultRecord: StoredUsageRecord = {
    date: today,
    aiRequests: 0,
    webSearches: 0,
    imageRequests: 0,
    pdfRequests: 0,
  };

  if (typeof window === 'undefined') {
    return defaultRecord;
  }

  try {
    const raw = localStorage.getItem(LOCAL_USAGE_KEY);
    if (!raw) return defaultRecord;

    const parsed: StoredUsageRecord = JSON.parse(raw);
    if (parsed && parsed.date === today) {
      return {
        date: today,
        aiRequests: Number(parsed.aiRequests) || 0,
        webSearches: Number(parsed.webSearches) || 0,
        imageRequests: Number(parsed.imageRequests) || 0,
        pdfRequests: Number(parsed.pdfRequests) || 0,
      };
    }

    // New day: roll over and reset
    localStorage.setItem(LOCAL_USAGE_KEY, JSON.stringify(defaultRecord));
    return defaultRecord;
  } catch (e) {
    console.warn('Failed to parse local usage record:', e);
    return defaultRecord;
  }
}

export function incrementLocalUsage(feature: FeatureType, count: number = 1): StoredUsageRecord {
  const current = getLocalUsageRecord();
  current[feature] = (current[feature] || 0) + count;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_USAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save local usage record:', e);
    }
  }

  return current;
}

export function buildClientUsageStats(
  isAuth: boolean,
  serverStats?: DailyUsageStats | null
): DailyUsageStats {
  const limits = isAuth ? USAGE_LIMITS.free : USAGE_LIMITS.guest;
  const local = getLocalUsageRecord();
  const today = getTodayUtcString();

  // If server stats are present and valid for today, take the maximum of server and local counts
  const serverAi = serverStats && serverStats.date === today ? serverStats.aiRequests?.used || 0 : 0;
  const serverWeb = serverStats && serverStats.date === today ? serverStats.webSearches?.used || 0 : 0;
  const serverImg = serverStats && serverStats.date === today ? serverStats.imageRequests?.used || 0 : 0;
  const serverPdf = serverStats && serverStats.date === today ? serverStats.pdfRequests?.used || 0 : 0;

  const aiUsed = Math.max(local.aiRequests, serverAi);
  const webUsed = Math.max(local.webSearches, serverWeb);
  const imgUsed = Math.max(local.imageRequests, serverImg);
  const pdfUsed = Math.max(local.pdfRequests, serverPdf);

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

export function getTimeUntilUtcMidnight(): { hours: number; minutes: number; formatted: string } {
  const now = new Date();
  const utcNow = now.getTime();
  const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)).getTime();
  const diffMs = Math.max(0, tomorrowUtc - utcNow);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes.toString().padStart(2, '0')}m`,
  };
}

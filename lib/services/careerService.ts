'use client';

export interface ResumeAnalysisResult {
  candidateName?: string;
  summary: string;
  overallScore: number;
  topSkills: string[];
  strengths: string[];
  improvements: string[];
  suggestedBullets: { original: string; improved: string; rationale: string }[];
  missingSections: string[];
}

export interface JobMatchResult {
  matchScore: number;
  scoreRationale: string;
  matchingSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  experienceAlignment: string;
  actionableRecommendations: string[];
}

export interface CareerSession {
  id: string;
  resumeName: string;
  resumeText: string;
  targetJobTitle?: string;
  jobDescription?: string;
  analysis?: ResumeAnalysisResult;
  jobMatch?: JobMatchResult;
  coverLetter?: string;
  interviewQuestions?: string[];
  learningRoadmap?: { step: string; timeframe: string; resources: string }[];
  createdAt: string;
  updatedAt: string;
}

const CAREER_STORAGE_KEY = 'nyra_career_sessions';

let cachedUserId: string | null = null;

function getStorageKey(userId?: string | null): string {
  const uid = userId || cachedUserId;
  return uid ? `nyra_career_${uid}` : CAREER_STORAGE_KEY;
}

export function setCareerActiveUser(userId: string | null): void {
  cachedUserId = userId;
}

export function getCareerSessions(userId?: string): CareerSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load career sessions:', e);
    return [];
  }
}

export function saveCareerSessions(sessions: CareerSession[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('nyra_career_updated', { detail: sessions }));
  } catch (e) {
    console.error('Failed to save career sessions:', e);
  }
}

export function saveCareerSession(session: CareerSession, userId?: string): void {
  const all = getCareerSessions(userId).filter((s) => s.id !== session.id);
  saveCareerSessions([session, ...all], userId);
}

export function deleteCareerSession(id: string, userId?: string): boolean {
  const all = getCareerSessions(userId).filter((s) => s.id !== id);
  saveCareerSessions(all, userId);
  return true;
}

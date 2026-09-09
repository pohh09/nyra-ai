'use client';

export interface ResumeAnalysisResult {
  candidateName?: string;
  summary: string;
  overallScore: number; // 0 - 100 estimated
  topSkills: string[];
  strengths: string[];
  improvements: string[];
  suggestedBullets: { original: string; improved: string; rationale: string }[];
  missingSections: string[];
}

export interface JobMatchResult {
  matchScore: number; // 0 - 100 estimated
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

export function getCareerSessions(): CareerSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load career sessions:', e);
    return [];
  }
}

export function saveCareerSessions(sessions: CareerSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('nyra_career_updated', { detail: sessions }));
  } catch (e) {
    console.error('Failed to save career sessions:', e);
  }
}

export function saveCareerSession(session: CareerSession): void {
  const all = getCareerSessions().filter((s) => s.id !== session.id);
  saveCareerSessions([session, ...all]);
}

export function deleteCareerSession(id: string): boolean {
  const all = getCareerSessions().filter((s) => s.id !== id);
  saveCareerSessions(all);
  return true;
}

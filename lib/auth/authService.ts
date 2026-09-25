'use client';

import { UserProfile, UserPreferences } from '@/lib/types';

export interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  avatarUrl?: string;
  interests?: string[];
  goals?: string[];
  preferredResponseStyle?: string[];
  experienceLevel?: string;
  customInstructions?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: Partial<UserPreferences>;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    createdAt: string;
  };
  expiresAt: number;
}

const ACCOUNTS_STORAGE_KEY = 'nyra_accounts_store';
const SESSION_STORAGE_KEY = 'nyra_active_session';
const SESSION_COOKIE_NAME = 'nyra_session_token';

// Web Crypto SHA-256 with Salt for secure password hashing
async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    // Fallback simple hash for non-crypto environments
    let hash = 0;
    const combined = password + salt;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derived = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateRandomSalt(): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts:', e);
  }
}

function setSessionCookie(token: string, maxAgeSeconds: number = 60 * 60 * 24 * 30): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export async function localSignUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ success: boolean; user?: StoredAccount; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const accounts = getAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  const salt = generateRandomSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const finalDisplayName = displayName?.trim() || cleanEmail.split('@')[0];

  const newAccount: StoredAccount = {
    id: userId,
    email: cleanEmail,
    passwordHash,
    salt,
    displayName: finalDisplayName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // Auto sign in upon sign up
  await createLocalSession(newAccount);

  return { success: true, user: newAccount };
}

export async function localSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: StoredAccount; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Please enter both your email address and password' };
  }

  const accounts = getAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!account) {
    return { success: false, error: 'No account found with this email. Please create an account.' };
  }

  const computedHash = await hashPassword(password, account.salt);
  if (computedHash !== account.passwordHash) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  await createLocalSession(account);
  return { success: true, user: account };
}

async function createLocalSession(account: StoredAccount): Promise<AuthSession> {
  const sessionToken = `session_${account.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  const session: AuthSession = {
    token: sessionToken,
    user: {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      avatarUrl: account.avatarUrl,
      createdAt: account.createdAt,
    },
    expiresAt,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem('nyra_active_user_id', account.id);
  }

  setSessionCookie(sessionToken);
  return session;
}

export function getLocalSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (!session || !session.user || !session.token) return null;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localSignOut();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function localSignOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('nyra_active_user_id');
  }
  clearSessionCookie();
}

export function updateLocalAccountPreferences(userId: string, prefs: Partial<UserPreferences>): void {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx !== -1) {
    accounts[idx].preferences = { ...accounts[idx].preferences, ...prefs };
    accounts[idx].updatedAt = new Date().toISOString();
    saveAccounts(accounts);
  }
}

export function updateLocalAccountProfile(
  userId: string,
  updates: { displayName?: string; avatarUrl?: string }
): StoredAccount | null {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx === -1) return null;

  if (updates.displayName !== undefined) accounts[idx].displayName = updates.displayName;
  if (updates.avatarUrl !== undefined) accounts[idx].avatarUrl = updates.avatarUrl;
  accounts[idx].updatedAt = new Date().toISOString();

  saveAccounts(accounts);

  // Update session if it's the current user
  const session = getLocalSession();
  if (session && session.user.id === userId) {
    session.user.displayName = accounts[idx].displayName;
    session.user.avatarUrl = accounts[idx].avatarUrl;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  }

  return accounts[idx];
}

export function updateLocalAccountOnboarding(
  userId: string,
  onboarding: {
    interests?: string[];
    goals?: string[];
    preferredResponseStyle?: string[];
    experienceLevel?: string;
    customInstructions?: string;
    onboardingCompleted?: boolean;
  }
): StoredAccount | null {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx === -1) return null;

  if (onboarding.interests !== undefined) accounts[idx].interests = onboarding.interests;
  if (onboarding.goals !== undefined) accounts[idx].goals = onboarding.goals;
  if (onboarding.preferredResponseStyle !== undefined) accounts[idx].preferredResponseStyle = onboarding.preferredResponseStyle;
  if (onboarding.experienceLevel !== undefined) accounts[idx].experienceLevel = onboarding.experienceLevel;
  if (onboarding.customInstructions !== undefined) accounts[idx].customInstructions = onboarding.customInstructions;
  if (onboarding.onboardingCompleted !== undefined) accounts[idx].onboardingCompleted = onboarding.onboardingCompleted;
  accounts[idx].updatedAt = new Date().toISOString();

  saveAccounts(accounts);
  return accounts[idx];
}

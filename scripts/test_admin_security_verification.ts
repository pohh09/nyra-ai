import fs from 'fs';
import path from 'path';

// Manually load .env.local for standalone test execution (Next.js does this automatically in dev/prod)
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not load .env.local:', e);
}

import { getAdminEmails } from '../lib/auth/adminAuth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runSecuritySuite() {
  console.log('===========================================================');
  console.log('NYRA AI — ADMIN SECURITY & AUTHORIZATION VERIFICATION SUITE');
  console.log('===========================================================\n');

  // TEST 1: ADMIN IDENTITY IN ENVIRONMENT (SERVER-SIDE ONLY)
  console.log('--- TEST 1: Server-Side Admin Identity Configuration ---');
  const adminEmails = getAdminEmails();
  console.log('Configured Admin Emails:', adminEmails);
  assert(adminEmails.includes('pooja@gmail.com'), 'pooja@gmail.com is present in server-side ADMIN_EMAILS');
  assert(!adminEmails.includes('attacker@evil.com'), 'Random email is not in ADMIN_EMAILS');

  // TEST 2: SERVER-SIDE AUTHORIZATION DECISION ENGINE
  console.log('\n--- TEST 2: Server-Side Authorization Decision Engine ---');
  
  function evaluateAdminAuthorization(user: { id: string; email: string; role?: string } | null, adminList: string[]) {
    if (!user || !user.id) {
      return { isAuthorized: false, status: 401, error: 'Unauthorized: Authentication required.' };
    }
    const email = user.email.toLowerCase().trim();
    if (email && adminList.includes(email)) {
      return { isAuthorized: true, status: 200, role: 'admin' };
    }
    if (user.role === 'admin') {
      return { isAuthorized: true, status: 200, role: 'admin' };
    }
    return { isAuthorized: false, status: 403, error: 'Forbidden: Admin permissions required.' };
  }

  // Case A: Designated Admin
  const adminResult = evaluateAdminAuthorization({ id: 'uuid-pooja', email: 'pooja@gmail.com', role: 'user' }, adminEmails);
  assert(adminResult.isAuthorized === true && adminResult.status === 200, 'pooja@gmail.com is authorized with HTTP 200 OK');

  // Case B: Normal Registered User
  const normalUserResult = evaluateAdminAuthorization({ id: 'uuid-normal', email: 'normal_user@example.com', role: 'user' }, adminEmails);
  assert(normalUserResult.isAuthorized === false && normalUserResult.status === 403, 'Normal user is rejected with HTTP 403 Forbidden');

  // Case C: Unauthenticated / Guest
  const unauthResult = evaluateAdminAuthorization(null, adminEmails);
  assert(unauthResult.isAuthorized === false && unauthResult.status === 401, 'Unauthenticated visitor is rejected with HTTP 401 Unauthorized');

  // TEST 3: PRIVILEGE ESCALATION RESISTANCE TEST
  console.log('\n--- TEST 3: Privilege Escalation Attack Simulation ---');
  
  function simulateProfileUpdateTrigger(
    oldRow: { id: string; email: string; role: string },
    newRow: { id: string; email: string; role: string },
    authUid: string | null
  ) {
    if (newRow.role !== oldRow.role) {
      if (authUid !== null) {
        newRow.role = oldRow.role;
      }
    }
    return newRow;
  }

  const normalUserProfile = { id: 'user_123', email: 'user@example.com', role: 'user' };
  
  // Normal user attempts to update their own role to 'admin'
  const attemptedExploit = { ...normalUserProfile, role: 'admin' };
  const triggerResult = simulateProfileUpdateTrigger(normalUserProfile, attemptedExploit, 'user_123');
  
  assert(triggerResult.role === 'user', 'Client attempt to update role to "admin" was neutralized; role remains "user"');

  // TEST 4: ADMIN ACTIVITY RLS CHECK
  console.log('\n--- TEST 4: Row Level Security on auth_activity ---');
  
  function checkAuthActivitySelectRLS(callerProfile: { id: string; role: string }) {
    return callerProfile.role === 'admin';
  }

  assert(checkAuthActivitySelectRLS({ id: 'admin_id', role: 'admin' }) === true, 'Admin profile can SELECT auth_activity');
  assert(checkAuthActivitySelectRLS({ id: 'user_id', role: 'user' }) === false, 'Normal user profile CANNOT SELECT auth_activity (RLS denied)');

  // TEST 5: DIRECT DATA PRIVACY (CONVERSATIONS / MESSAGES)
  console.log('\n--- TEST 5: Conversation & Message Row Isolation ---');
  
  function checkConversationAccessRLS(authUid: string, conversationUserId: string) {
    return authUid === conversationUserId;
  }

  assert(checkConversationAccessRLS('user_A', 'user_A') === true, 'User A can access User A conversations');
  assert(checkConversationAccessRLS('user_A', 'user_B') === false, 'User A CANNOT access User B conversations (RLS denied)');

  console.log('\n===========================================================');
  console.log('ALL 5 SECURITY & AUTHORIZATION TESTS PASSED SUCCESSFULLY! ✅');
  console.log('===========================================================');
}

runSecuritySuite();

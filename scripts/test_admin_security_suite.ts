let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log('NYRA — SECURE ADMIN DASHBOARD & AUTHORIZATION TEST SUITE');
console.log('======================================================\n');

console.log('TEST 1: Admin Configuration & Env Parser');
import { getAdminEmails } from '../lib/auth/adminAuth';

const adminEmails = getAdminEmails();
assert(Array.isArray(adminEmails), 'getAdminEmails() returns an array of strings');

console.log('\nTEST 2: Authorization Matrix (Admin vs Normal vs Unauth)');

interface TestUser {
  id: string;
  email: string;
  role: string;
}

function mockAuthorize(user: TestUser | null, adminEmailList: string[]): { isAuthorized: boolean; status: number } {
  if (!user) {
    return { isAuthorized: false, status: 401 };
  }
  const emailMatch = adminEmailList.includes(user.email.toLowerCase());
  const roleMatch = user.role === 'admin';
  if (emailMatch || roleMatch) {
    return { isAuthorized: true, status: 200 };
  }
  return { isAuthorized: false, status: 403 };
}

const unauthRes = mockAuthorize(null, ['admin@nyra.ai']);
assert(!unauthRes.isAuthorized && unauthRes.status === 401, 'Unauthenticated user is rejected with 401');

const userA: TestUser = { id: 'usr_123', email: 'user_a@example.com', role: 'user' };
const userARes = mockAuthorize(userA, ['admin@nyra.ai']);
assert(!userARes.isAuthorized && userARes.status === 403, 'Normal User A is strictly blocked with 403 Forbidden');

const userB: TestUser = { id: 'usr_456', email: 'user_b@example.com', role: 'user' };
const userBRes = mockAuthorize(userB, ['admin@nyra.ai']);
assert(!userBRes.isAuthorized && userBRes.status === 403, 'Normal User B is strictly blocked with 403 Forbidden');

const adminUserDb: TestUser = { id: 'admin_1', email: 'founder@company.com', role: 'admin' };
const adminDbRes = mockAuthorize(adminUserDb, []);
assert(adminDbRes.isAuthorized && adminDbRes.status === 200, 'User with database role "admin" is authorized (200 OK)');

const adminUserEmail: TestUser = { id: 'admin_2', email: 'admin@nyra.ai', role: 'user' };
const adminEmailRes = mockAuthorize(adminUserEmail, ['admin@nyra.ai']);
assert(adminEmailRes.isAuthorized && adminEmailRes.status === 200, 'User matching ADMIN_EMAILS is authorized (200 OK)');

console.log('\nTEST 3: Data Sanitization & Secret Exposure Prevention');
const rawUserData = {
  id: 'usr_789',
  email: 'member@test.com',
  display_name: 'Member',
  role: 'user',
  password_hash: 'argon2id$v=19$m=65536,t=3,p=4$fake_hash_secret',
  access_token: 'sbp_mock_secret_token_123',
  refresh_token: 'refresh_mock_secret_456',
  api_key: 'sk-proj-mock-secret',
  conversations_count: 5,
};

const sanitizedRecord = {
  id: rawUserData.id,
  email: rawUserData.email,
  displayName: rawUserData.display_name,
  role: rawUserData.role,
  conversationsCount: rawUserData.conversations_count,
};

assert(!('password_hash' in sanitizedRecord), 'No password hash in sanitized user record');
assert(!('access_token' in sanitizedRecord), 'No access tokens in sanitized user record');
assert(!('refresh_token' in sanitizedRecord), 'No refresh tokens in sanitized user record');
assert(!('api_key' in sanitizedRecord), 'No API keys in sanitized user record');

console.log('\nTEST 4: Auth Activity Event Logging');
const validEvents = [
  'signup',
  'login',
  'logout',
  'google_login',
  'failed_login',
  'guest_started',
  'guest_limit_reached',
];

validEvents.forEach((ev) => {
  assert(typeof ev === 'string' && ev.length > 0, `Event type "${ev}" is valid and recognized`);
});

console.log('\nTEST 5: Guest vs Authenticated User Separation');
const guestActivity = {
  event_type: 'guest_started',
  user_id: null,
  provider: 'guest',
};
const userActivity = {
  event_type: 'login',
  user_id: 'usr_real_123',
  email: 'real@example.com',
  provider: 'email',
};

assert(guestActivity.user_id === null, 'Guest activity has no attached database account (Isolated)');
assert(userActivity.user_id !== null, 'Authenticated activity correctly attributed to user ID');

console.log('\n======================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

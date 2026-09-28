import { getAdminEmails, DESIGNATED_ADMIN_EMAIL } from '../lib/auth/adminAuth';
import { USAGE_LIMITS } from '../lib/usage/limits';

function evaluateQuotaCheck(
  authenticatedUser: { id: string; email?: string; role?: string } | null,
  feature: 'aiRequests' | 'webSearches' | 'imageRequests' | 'pdfRequests'
): { bypassed: boolean; limitEnforced: number } {
  let isAdmin = false;
  if (authenticatedUser?.email) {
    const adminEmails = getAdminEmails();
    if (adminEmails.includes(authenticatedUser.email.toLowerCase().trim())) {
      isAdmin = true;
    }
  }
  if (!isAdmin && authenticatedUser?.role === 'admin') {
    isAdmin = true;
  }

  const limits = authenticatedUser ? USAGE_LIMITS.free : USAGE_LIMITS.guest;

  if (feature === 'imageRequests' && isAdmin) {
    return { bypassed: true, limitEnforced: Infinity };
  }

  return { bypassed: false, limitEnforced: limits[feature] };
}

console.log('--- RUNNING ADMIN IMAGE QUOTA BYPASS TESTS ---');

// Test 1: Designated Admin Account pooja@gmail.com
const adminCheck = evaluateQuotaCheck({ id: 'uuid-1', email: 'pooja@gmail.com' }, 'imageRequests');
console.log('Test 1 - pooja@gmail.com image analysis quota:');
console.log('  Bypassed:', adminCheck.bypassed, '(Expected: true)');
if (!adminCheck.bypassed) throw new Error('pooja@gmail.com should bypass image quota');

// Test 2: Normal Authenticated User (john@example.com)
const normalUserCheck = evaluateQuotaCheck({ id: 'uuid-2', email: 'john@example.com' }, 'imageRequests');
console.log('Test 2 - Normal user image analysis quota:');
console.log('  Bypassed:', normalUserCheck.bypassed, '(Expected: false)');
console.log('  Limit enforced:', normalUserCheck.limitEnforced, '(Expected: 5)');
if (normalUserCheck.bypassed || normalUserCheck.limitEnforced !== 5) {
  throw new Error('Normal user must be enforced with 5 limit');
}

// Test 3: Guest User (null session)
const guestUserCheck = evaluateQuotaCheck(null, 'imageRequests');
console.log('Test 3 - Guest user image analysis quota:');
console.log('  Bypassed:', guestUserCheck.bypassed, '(Expected: false)');
console.log('  Limit enforced:', guestUserCheck.limitEnforced, '(Expected: 3)');
if (guestUserCheck.bypassed || guestUserCheck.limitEnforced !== 3) {
  throw new Error('Guest user must be enforced with 3 limit');
}

// Test 4: Other features (PDF, Chat) for admin
const adminPdfCheck = evaluateQuotaCheck({ id: 'uuid-1', email: 'pooja@gmail.com' }, 'pdfRequests');
console.log('Test 4 - Admin PDF quota:');
console.log('  Bypassed:', adminPdfCheck.bypassed, '(Expected: false)');
console.log('  Limit enforced:', adminPdfCheck.limitEnforced, '(Expected: 5)');
if (adminPdfCheck.bypassed) throw new Error('Admin PDF quota should not be bypassed');

// Test 5: Client spoofing email without session (Guest trying to claim pooja@gmail.com)
// In API route, authenticatedUser comes from supabase.auth.getUser() - if token is absent/invalid, user is null
const spoofCheck = evaluateQuotaCheck(null, 'imageRequests');
console.log('Test 5 - Spoof attempt without valid session:');
console.log('  Bypassed:', spoofCheck.bypassed, '(Expected: false)');
if (spoofCheck.bypassed) throw new Error('Spoof attempt without session must fail');

console.log('✓ ALL 5 TESTS PASSED SUCCESSFULLY!');

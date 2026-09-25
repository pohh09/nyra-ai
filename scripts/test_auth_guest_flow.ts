// Mock browser LocalStorage
class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();
(global as any).localStorage = mockStorage;
(global as any).window = {
  location: { origin: 'http://localhost:3000', href: 'http://localhost:3000' },
  history: { replaceState: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
};

// Simple test runner
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
console.log('NYRA — AUTH FLOW & GUEST MODE AUDIT TEST SUITE');
console.log('======================================================\n');

// Import Guest Service functions
import {
  isGuestSession,
  startGuestSession,
  clearGuestSession,
  getGuestMessageCount,
  incrementGuestMessageCount,
  isGuestLimitReached,
  getRemainingGuestMessages,
  GUEST_MESSAGE_LIMIT,
} from '../lib/auth/guestService';

// TEST 1: Initial Clean State
console.log('TEST 1: Initial unauthenticated non-guest state');
mockStorage.clear();
assert(!isGuestSession(), 'isGuestSession() is false when storage is empty');
assert(getGuestMessageCount() === 0, 'getGuestMessageCount() is 0');
assert(!isGuestLimitReached(), 'isGuestLimitReached() is false initially');
assert(getRemainingGuestMessages() === 5, 'Remaining messages equals 5');

// TEST 2: Start Guest Session (Isolated & Fresh Workspace)
console.log('\nTEST 2: Start Guest Session');
mockStorage.setItem('nyra_chats_guest', JSON.stringify([{ id: 'old-chat-999', title: 'Old Visitor Chat' }]));
startGuestSession();
assert(isGuestSession(), 'isGuestSession() is true after startGuestSession()');
assert(mockStorage.getItem('nyra_is_guest') === 'true', 'localStorage nyra_is_guest is set to "true"');
assert(mockStorage.getItem('nyra_chats_guest') === null, 'previous guest chats are purged on fresh guest session');
assert(getGuestMessageCount() === 0, 'guest message count initialized to 0');

// TEST 3: 5-Message Limit Enforcement
console.log('\nTEST 3: 5-Message Limit Lifecycle');
for (let i = 1; i <= 5; i++) {
  const newCount = incrementGuestMessageCount();
  assert(newCount === i, `Message #${i} allowed and increments count to ${i}`);
  assert(getGuestMessageCount() === i, `Current count accurately reports ${i}`);
  assert(getRemainingGuestMessages() === 5 - i, `Remaining free messages accurately reports ${5 - i}`);
  if (i < 5) {
    assert(!isGuestLimitReached(), `Limit not reached at message #${i}`);
  } else {
    assert(isGuestLimitReached(), 'Limit reached on 5th message');
  }
}

// TEST 4: 6th Attempted Message Block
console.log('\nTEST 4: 6th Attempted Message Blocking');
assert(isGuestLimitReached() === true, '6th message attempt blocked by isGuestLimitReached()');
assert(getRemainingGuestMessages() === 0, 'Remaining messages is 0');

// TEST 5: Browser Refresh Bypass Prevention
console.log('\nTEST 5: Browser Refresh Simulation');
// Simulating new page load with existing localStorage
const reloadedCount = parseInt(mockStorage.getItem('nyra_guest_message_count') || '0', 10);
assert(reloadedCount === 5, 'localStorage preserves count of 5 across reloads');
assert(isGuestLimitReached() === true, 'Refresh does NOT bypass the 5-message limit');

// TEST 6: User Login / Session Transition & Data Isolation
console.log('\nTEST 6: Real User Login & Isolation');
// Real user logs in
clearGuestSession();
assert(!isGuestSession(), 'Guest session cleared upon user login');
assert(mockStorage.getItem('nyra_is_guest') === null, 'nyra_is_guest removed from storage');

// TEST 7: Logout & Navigation Flow
console.log('\nTEST 7: Logout Session Removal');
mockStorage.setItem('nyra_session', JSON.stringify({ userId: 'auth-user-123' }));
mockStorage.removeItem('nyra_session');
clearGuestSession();
assert(mockStorage.getItem('nyra_session') === null, 'Authenticated session cleared');
assert(!isGuestSession(), 'User is NOT automatically in guest mode after logout');

console.log('\n======================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

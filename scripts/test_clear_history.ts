import assert from 'assert';
import { clearAllChats, loadChats, saveChats } from '../lib/storage';

// Mock browser localStorage & sessionStorage environment
const storageMap: Record<string, string> = {};
const sessionMap: Record<string, string> = {};

(global as any).window = {};
(global as any).localStorage = {
  getItem: (key: string) => storageMap[key] ?? null,
  setItem: (key: string, value: string) => { storageMap[key] = value; },
  removeItem: (key: string) => { delete storageMap[key]; },
  get length() { return Object.keys(storageMap).length; },
  key: (index: number) => Object.keys(storageMap)[index] ?? null,
  clear: () => { Object.keys(storageMap).forEach((k) => delete storageMap[k]); },
};

(global as any).sessionStorage = {
  getItem: (key: string) => sessionMap[key] ?? null,
  setItem: (key: string, value: string) => { sessionMap[key] = value; },
  removeItem: (key: string) => { delete sessionMap[key]; },
  clear: () => { Object.keys(sessionMap).forEach((k) => delete sessionMap[k]); },
};

console.log('======================================================');
console.log('CLEAR HISTORY VERIFICATION SUITE');
console.log('======================================================');

// Setup mock chats for user and guest
const userAId = 'usr_test_123';
const mockUserChats = [
  {
    id: 'chat_1',
    title: 'Chat One',
    messages: [{ id: 'm1', role: 'user', content: 'Hello' }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'chat_2',
    title: 'Chat Two',
    messages: [{ id: 'm2', role: 'assistant', content: 'World' }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

saveChats(mockUserChats as any, userAId);
localStorage.setItem('nyra_chats_guest', JSON.stringify([{ id: 'guest_1', title: 'Guest Chat', messages: [] }]));
localStorage.setItem('ai_chats', JSON.stringify([{ id: 'legacy_1', title: 'Legacy Chat', messages: [] }]));
localStorage.setItem('nyra_share_chat_1', JSON.stringify({ id: 'chat_1', title: 'Shared' }));
localStorage.setItem('nyra_bookmarked_ids', JSON.stringify(['m1', 'm2']));
localStorage.setItem('nyra_current_chat_id', 'chat_1');
localStorage.setItem('nyra_active_chat_id', 'chat_1');
sessionStorage.setItem('nyra_initial_prompt', 'Initial pending prompt');

console.log('\nTEST 1: Verify data populated before clear');
assert.strictEqual(loadChats(userAId).length, 2, 'User A has 2 chats saved');
assert(localStorage.getItem('nyra_bookmarked_ids') !== null, 'Bookmarks exist');
assert(localStorage.getItem('nyra_share_chat_1') !== null, 'Shared chat exists');
assert(sessionStorage.getItem('nyra_initial_prompt') !== null, 'Session prompt exists');
console.log('  ✅ PASS: Initial chat data verified');

console.log('\nTEST 2: Execute clearAllChats(userAId)');
clearAllChats(userAId);

const postClearChats = loadChats(userAId);
assert.strictEqual(postClearChats.length, 0, 'loadChats returns empty array after clear');
assert.strictEqual(localStorage.getItem(`nyra_chats_${userAId}`), '[]', 'User chat key is empty array');
assert.strictEqual(localStorage.getItem('nyra_chats_guest'), '[]', 'Guest chat key is empty array');
assert.strictEqual(localStorage.getItem('ai_chats'), null, 'Legacy ai_chats removed');
assert.strictEqual(localStorage.getItem('nyra_share_chat_1'), null, 'Shared chat caches purged');
assert.strictEqual(localStorage.getItem('nyra_bookmarked_ids'), null, 'Bookmark IDs purged');
assert.strictEqual(localStorage.getItem('nyra_current_chat_id'), null, 'Current chat ID purged');
assert.strictEqual(localStorage.getItem('nyra_active_chat_id'), null, 'Active chat ID purged');
assert.strictEqual(sessionStorage.getItem('nyra_initial_prompt'), null, 'Session prompt cleared');
console.log('  ✅ PASS: All chat data, bookmarks, share caches, and session prompts completely cleared');

console.log('\nTEST 3: Verify guest session clearAllChats()');
localStorage.setItem('nyra_is_guest', 'true');
localStorage.setItem('nyra_chats_guest', JSON.stringify([{ id: 'g1', title: 'Guest chat', messages: [] }]));
assert.strictEqual(loadChats().length, 1, 'Guest chat loaded');
clearAllChats();
assert.strictEqual(loadChats().length, 0, 'Guest chat cleared');
console.log('  ✅ PASS: Guest chat history cleared successfully');

console.log('\n======================================================');
console.log('ALL CLEAR HISTORY TESTS PASSED (3/3)');
console.log('======================================================');

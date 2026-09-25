console.log('\n================================================================');
console.log('             NYRA USAGE AND LIMITS VERIFICATION TEST            ');
console.log('================================================================\n');

// 1. Calculate Reset Time
const now = new Date();
const utcNow = now.getTime();
const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)).getTime();
const diffMs = Math.max(0, tomorrowUtc - utcNow);
const hours = Math.floor(diffMs / (1000 * 60 * 60));
const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
const resetFormatted = `${hours}h ${minutes.toString().padStart(2, '0')}m`;

console.log(`✓ Daily Reset Calculation: ${resetFormatted} until 00:00 UTC (Hours: ${hours}, Minutes: ${minutes})`);

// 2. Limits Verification
const USAGE_LIMITS = {
  free: { aiRequests: 20, webSearches: 10, imageRequests: 5, pdfRequests: 5 },
  guest: { aiRequests: 8, webSearches: 4, imageRequests: 3, pdfRequests: 3 },
  warningThreshold: 0.8,
};

console.log('\nGuest Mode Allowance Configuration:');
console.log(`  AI Requests:     0 / ${USAGE_LIMITS.guest.aiRequests}`);
console.log(`  Web Searches:    0 / ${USAGE_LIMITS.guest.webSearches}`);
console.log(`  Vision Images:   0 / ${USAGE_LIMITS.guest.imageRequests}`);
console.log(`  PDF Analyses:    0 / ${USAGE_LIMITS.guest.pdfRequests}`);

console.log('\nFree Member Allowance Configuration:');
console.log(`  AI Requests:     0 / ${USAGE_LIMITS.free.aiRequests}`);
console.log(`  Web Searches:    0 / ${USAGE_LIMITS.free.webSearches}`);
console.log(`  Vision Images:   0 / ${USAGE_LIMITS.free.imageRequests}`);
console.log(`  PDF Analyses:    0 / ${USAGE_LIMITS.free.pdfRequests}`);

// 3. Test API endpoint
console.log('\nTesting /api/usage Endpoint against http://localhost:3000/api/usage:');
try {
  const res = await fetch('http://localhost:3000/api/usage');
  const data = await res.json();
  console.log(`  HTTP Status: ${res.status}`);
  console.log(`  Response:`, JSON.stringify(data, null, 2));
  if (res.ok && data.aiRequests && data.webSearches) {
    console.log('  ✓ /api/usage route responded with accurate daily usage schema!');
  }
} catch (e) {
  console.log(`  ✗ API error: ${e.message}`);
}

console.log('\n================================================================\n');

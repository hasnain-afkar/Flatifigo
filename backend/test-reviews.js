const http = require('http');

function apiReq(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const r = http.request({ hostname: 'localhost', port: 5000, path, method, headers }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { resolve({ raw: b }); } });
    });
    if (data) r.write(data);
    r.end();
  });
}

async function login(email) {
  const r = await apiReq('POST', '/api/auth/login', { email, password: 'pass123' });
  return r.token;
}

(async () => {
  let pass = 0, fail = 0;
  function check(name, condition) {
    if (condition) { pass++; console.log(`  ✅ ${name}`); }
    else { fail++; console.log(`  ❌ ${name}`); }
  }

  console.log('\n=== Setup ===');
  const userToken = await login('hasnain@demo.com');
  const user2Token = await login('talal@demo.com');
  const ownerToken = await login('ali.owner@demo.com');
  
  check('Logins succeeded', userToken && ownerToken && user2Token);

  // 1. Create a listing to review
  const cl = await apiReq('POST', '/api/listings', {
    title: 'Review Target Flat', description: 'Testing review system', rent: 20000,
    rooms: 2, city: 'islamabad', area: 'G-10', amenities: ['wifi'],
    contactName: 'Ali', contactPhone: '0300'
  }, ownerToken);
  const listingId = cl.listing?.id;
  check('Test listing created', !!listingId);

  // 2. Get owner user ID for user review
  const adminToken = await login('admin@demo.com');
  const adminUsers = await apiReq('GET', '/api/admin/users', null, adminToken);
  const ownerUser = adminUsers.users.find(u => u.email === 'ali.owner@demo.com');
  const ownerId = ownerUser.id || ownerUser._id;

  console.log('\n=== Testing Listing Reviews ===');

  // Review the listing
  const r1 = await apiReq('POST', '/api/reviews', {
    targetType: 'listing', targetId: listingId, rating: 5, comment: 'Great flat!'
  }, userToken);
  check('User 1 reviewed listing', r1.success);

  // Duplicate review should fail
  const r1dup = await apiReq('POST', '/api/reviews', {
    targetType: 'listing', targetId: listingId, rating: 4
  }, userToken);
  check('Duplicate review prevented', !r1dup.success);

  // User 2 reviews listing
  const r2 = await apiReq('POST', '/api/reviews', {
    targetType: 'listing', targetId: listingId, rating: 3, comment: 'Okay.'
  }, user2Token);
  check('User 2 reviewed listing', r2.success);

  // Check GET reviews
  const getReviews = await apiReq('GET', `/api/reviews/${listingId}`);
  check('GET reviews returns list', getReviews.success && getReviews.reviews.length === 2);

  console.log('\n=== Testing User Reviews ===');

  // Review a user
  const ru1 = await apiReq('POST', '/api/reviews', {
    targetType: 'user', targetId: ownerId, rating: 4, comment: 'Good roommate.'
  }, userToken);
  check('User reviewed roommate successfully', ru1.success);

  // Cannot review self
  const rSelf = await apiReq('POST', '/api/reviews', {
    targetType: 'user', targetId: ownerId, rating: 5
  }, ownerToken);
  check('Self-review prevented', !rSelf.success);

  // Invalid rating
  const rInvalid = await apiReq('POST', '/api/reviews', {
    targetType: 'listing', targetId: listingId, rating: 6
  }, ownerToken);
  check('Invalid rating rejected', !rInvalid.success);

  console.log(`\n${'='.repeat(44)}`);
  console.log(`  Reviews System Tests: ${pass} passed, ${fail} failed`);
  console.log(`${'='.repeat(44)}\n`);
  process.exit(fail > 0 ? 1 : 0);
})();

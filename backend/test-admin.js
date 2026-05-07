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

  // 1. Admin Login
  console.log('\n=== Admin Login ===');
  const adminToken = await login('admin@demo.com');
  check('Admin login succeeded', !!adminToken);

  // 2. Dashboard Stats
  console.log('\n=== Dashboard Stats ===');
  const stats = await apiReq('GET', '/api/admin/stats', null, adminToken);
  check('Stats returned', stats.success && stats.stats);
  check('Total users > 0', stats.stats.totalUsers > 0);
  check('Total listings > 0', stats.stats.totalListings > 0);
  console.log('  Stats:', JSON.stringify(stats.stats));

  // 3. User Management
  console.log('\n=== User Management ===');
  const users = await apiReq('GET', '/api/admin/users', null, adminToken);
  check('Users list returned', users.success && users.users.length > 0);
  const owner = users.users.find(u => u.email === 'ali.owner@demo.com');
  check('Owner found', !!owner);

  // 4. Block/Unblock
  console.log('\n=== Block/Unblock ===');
  const blockResult = await apiReq('PATCH', '/api/admin/users/' + owner.id + '/block', {}, adminToken);
  check('User blocked', blockResult.success);

  // Blocked user's token should fail
  const ownerToken = await login('ali.owner@demo.com');
  const profileReq = await apiReq('GET', '/api/profile', null, ownerToken);
  check('Blocked user denied access', !profileReq.success || profileReq.message.includes('blocked'));

  // Unblock
  const unblockResult = await apiReq('PATCH', '/api/admin/users/' + owner.id + '/unblock', {}, adminToken);
  check('User unblocked', unblockResult.success);
  const profileReq2 = await apiReq('GET', '/api/profile', null, ownerToken);
  check('Unblocked user can access', profileReq2.success);

  // 5. Pending Listings
  console.log('\n=== Pending Listings Flow ===');
  const createResult = await apiReq('POST', '/api/listings', {
    title: 'Test Pending Flat', description: 'Testing admin panel', rent: 20000,
    rooms: 2, city: 'islamabad', area: 'G-10', amenities: ['wifi'],
    contactName: 'Ali', contactPhone: '0300'
  }, ownerToken);
  check('Listing created as pending', createResult.listing?.status === 'pending');
  const listingId = createResult.listing?.id;

  const pending = await apiReq('GET', '/api/admin/listings', null, adminToken);
  check('Pending listings returned', pending.success && pending.listings.length > 0);

  // 6. Report System
  console.log('\n=== Report System ===');
  const t1 = await login('hasnain@demo.com');
  const r1 = await apiReq('POST', '/api/listings/' + listingId + '/report', { reason: 'fake', description: 'Test' }, t1);
  check('Report 1 filed', r1.success);

  const t2 = await login('talal@demo.com');
  const r2 = await apiReq('POST', '/api/listings/' + listingId + '/report', { reason: 'scam' }, t2);
  check('Report 2 filed', r2.success);

  const t3 = await login('humayl@demo.com');
  const r3 = await apiReq('POST', '/api/listings/' + listingId + '/report', { reason: 'inappropriate' }, t3);
  check('Report 3 filed (auto-flags listing)', r3.success);

  // Duplicate prevention
  const r4 = await apiReq('POST', '/api/listings/' + listingId + '/report', { reason: 'fake' }, t1);
  check('Duplicate report prevented', !r4.success);

  // 7. Admin sees reports
  console.log('\n=== Admin Reports ===');
  const reports = await apiReq('GET', '/api/admin/reports', null, adminToken);
  check('Reports returned', reports.success && reports.reports.length >= 3);

  const firstPending = reports.reports.find(r => r.status === 'pending');
  if (firstPending) {
    const resolve = await apiReq('PATCH', '/api/admin/reports/' + firstPending.id + '/resolve', {}, adminToken);
    check('Report resolved', resolve.success);
  }

  // 8. Flagged Listings
  console.log('\n=== Flagged Listings ===');
  const flagged = await apiReq('GET', '/api/admin/flagged', null, adminToken);
  check('Flagged listings returned', flagged.success && flagged.listings.length > 0);
  if (flagged.listings.length > 0) {
    check('Listing has 3+ reports', flagged.listings[0].reportCount >= 3);
  }

  // Delete flagged
  const del = await apiReq('DELETE', '/api/admin/flagged/' + listingId, null, adminToken);
  check('Flagged listing deleted', del.success);

  // 9. Access Control
  console.log('\n=== Access Control ===');
  const deny = await apiReq('GET', '/api/admin/stats', null, ownerToken);
  check('Non-admin denied admin endpoints', !deny.success);

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${pass} passed, ${fail} failed`);
  console.log(`${'='.repeat(40)}\n`);
  process.exit(fail > 0 ? 1 : 0);
})();
